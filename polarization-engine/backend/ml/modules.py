import torch
import torch.nn as nn
from transformers import AutoModel, AutoConfig

class PolarizationEncoder(nn.Module):
    """
    A multi-modal encoder that fuses textual news content with metadata features 
    (source bias, historic rage scores) to predict user engagement probability.
    or something like that.. idk man first time
    """
    def __init__(self, pretrained_model_name="bert-base-uncased", num_metadata_features=12, hidden_dim=256):
        super(PolarizationEncoder, self).__init__()
        
        # 1. Text Branch (Transformer backbone)
        self.config = AutoConfig.from_pretrained(pretrained_model_name)
        self.bert = AutoModel.from_pretrained(pretrained_model_name)
        
        # Freeze first 6 layers for transfer learning efficiency
        for param in self.bert.embeddings.parameters():
            param.requires_grad = False
        for layer in self.bert.encoder.layer[:6]:
            for param in layer.parameters():
                param.requires_grad = False

        # 2. Metadata Branch (Dense Network)
        self.meta_processor = nn.Sequential(
            nn.Linear(num_metadata_features, 64),
            nn.BatchNorm1d(64),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(64, 64)
        )

        # 3. Fusion Layer (Attention-gated fusion)
        self.fusion_gate = nn.Sequential(
            nn.Linear(self.config.hidden_size + 64, 1),
            nn.Sigmoid()
        )
        
        self.output_head = nn.Sequential(
            nn.Linear(self.config.hidden_size + 64, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, 1) # Regression output: Rage Score
        )

    def forward(self, input_ids, attention_mask, metadata):
        # Text embedding: [Batch, Sequence, Hidden] -> [Batch, Hidden] (CLS token)
        bert_out = self.bert(input_ids=input_ids, attention_mask=attention_mask)
        cls_embedding = bert_out.last_hidden_state[:, 0, :]
        
        # Metadata embedding
        meta_emb = self.meta_processor(metadata)
        
        # Concatenate
        combined = torch.cat((cls_embedding, meta_emb), dim=1)
        
        # Gated Fusion
        gate = self.fusion_gate(combined)
        weighted_features = combined * gate
        
        # Prediction
        rage_score = self.output_head(weighted_features)
        
        return rage_score

class BiasClassifier(nn.Module):
    """
    Auxiliary head for multi-task learning: Detects political bias direction.
    """
    def __init__(self, input_dim):
        super(BiasClassifier, self).__init__()
        self.classifier = nn.Linear(input_dim, 3) # Left, Center, Right

    def forward(self, x):
        return torch.softmax(self.classifier(x), dim=1)
