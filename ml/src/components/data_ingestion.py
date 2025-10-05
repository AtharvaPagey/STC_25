import os
import sys
from src.exception import CustomExeception
from sklearn.model_selection import train_test_split
from src.logger import logging
from dataclasses import dataclass
import pandas as pd

@dataclass
class DataIngestionConfig:
    train_data_path: str = os.path.join('artifacts', 'train.csv')
    test_data_path: str = os.path.join('artifacts', 'test.csv')
    raw_data_path: str = os.path.join('artifacts', 'raw.csv')

class DataIngestion:
    def __init__(self):
        self.dataingestionconfig = DataIngestionConfig()
    
    def initiate_data_ingestion(self):
        logging.info("Data Ingestion started")
        try:
            df = pd.read_excel('D:/stc_project_25/ml/notebook/data/Disease_classification.xlsx')
            logging.info('Read the raw data')

            os.makedirs(os.path.dirname(self.dataingestionconfig.raw_data_path), exist_ok=True)
            os.makedirs(os.path.dirname(self.dataingestionconfig.train_data_path), exist_ok=True)
            os.makedirs(os.path.dirname(self.dataingestionconfig.test_data_path), exist_ok=True)

            df.to_csv(self.dataingestionconfig.raw_data_path, index=False, header=True)
            logging.info("Raw data saved...Starting train test split")

            train_data, test_data = train_test_split(df, test_size=0.3, random_state=42)

            train_data.to_csv(self.dataingestionconfig.train_data_path, index = False, header = True)
            test_data.to_csv(self.dataingestionconfig.test_data_path, index = False, header=True)
            logging.info("Split successful and files saved")

            return(
                self.dataingestionconfig.train_data_path,
                self.dataingestionconfig.test_data_path
            )
        except Exception as e:
            raise CustomExeception(e, sys)
        

if __name__ == "__main__":
    d = DataIngestion()
    train_data, test_data = d.initiate_data_ingestion()
    print("Files created")