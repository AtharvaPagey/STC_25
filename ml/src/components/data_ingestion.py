import os
import sys
from src.exception import CustomExeception
from src.logger import logging
from dataclasses import dataclass
import pandas as pd
from src.components.data_transformation import DataTranformation
from src.components.model_finetuner import ModelFinetuner

@dataclass
class DataIngestionConfig:
    raw_data_path: str = os.path.join('artifacts', 'raw.csv')

class DataIngestion:
    def __init__(self):
        self.dataingestionconfig = DataIngestionConfig()
    
    def initiate_funetuning_data_ingestion(self, finetune_data_path):
        logging.info("Data Ingestion started")
        try:
            df = pd.read_excel(finetune_data_path)
            logging.info('Read the raw data')

            os.makedirs(os.path.dirname(self.dataingestionconfig.raw_data_path), exist_ok=True)

            df.to_csv(self.dataingestionconfig.raw_data_path, index=False, header=True)
            logging.info("Raw data saved")

            return(
                self.dataingestionconfig.raw_data_path
            )
        except Exception as e:
            raise CustomExeception(e, sys)