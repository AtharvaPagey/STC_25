import pandas as pd
import numpy as np
from src.exception import CustomExeception
from src.logger import logging
import os
import sys
from dataclasses import dataclass
from datasets import Features, ClassLabel, Value, Dataset
from transformers import AutoTokenizer
from thefuzz import process, fuzz



@dataclass
class DataTransformationConfig:
    preprocessor_obj_file_path: str = os.path.join('artifacts', 'preprocessor.pkl')

class DataTranformation:
    def __init__(self):
        self.data_transformation_config = DataTransformationConfig()
    
    def funetuning_datatransformer(self, data_path):
        try:
            def tokenize_function(examples):
                try:
                    return tokenizer(examples["text"], truncation=True, padding="max_length", max_length=4096)
                except Exception as e:
                    raise CustomExeception(e, sys)
            
            df = pd.read_csv(data_path)
            logging.info("Dataset loaded")

            tokenizer = AutoTokenizer.from_pretrained("yikuan8/Clinical-BigBird")

            if 'Unnamed: 0' in df.columns:
                df = df.drop(columns=['Unnamed: 0'])
            
            label_names = df['label'].unique().tolist()

            features = Features({
                'text': Value('string'),
                'label': ClassLabel(names=label_names)
            })

            dataset = Dataset.from_pandas(df, features=features)
            dataset = dataset.train_test_split(test_size=0.2)
            logging.info("train test split done")

            label_names = df['label'].unique().tolist()

            tokenized_data = dataset.map(tokenize_function, batched=True)
            logging.info("Data tokenized")

            tokenizer.save_pretrained(self.data_transformation_config.preprocessor_obj_file_path)
            logging.info("Preprocessor model saved")

            return(
                label_names,
                tokenized_data,
                self.data_transformation_config.preprocessor_obj_file_path
            )
        except Exception as e:
            raise CustomExeception(e, sys)
    
    def prediction_data_transformation(self, data):
        try:
            food = data['food']
            food_items = [item.strip() for item in food.split(',')]
            unique_items = list(dict.fromkeys(item for item in food_items if item))
            food = ", ".join(unique_items)
            food = ', Food Eaten in Last 5 Days ' + food
            logging.info("data cleaning has started")

            age = ' of age ' + data['age']
            if not age.isdigit():
                raise CustomExeception("Age not given", sys)
            
            gender = 'A ' + data['gender']

            occupation = data['occupation']
            extra_info = ""
            if occupation != "":
                occupation, extra_info = DataTranformation.clean_occupation_pipeline(data['occupation'])
                occupation = ', Occupation is ' + occupation

            travel_history = data['travel_history']
            if travel_history != "":
                travel_history = ', Recently Traveled to ' + travel_history

            symptoms = ', Symptoms are ' + data['symptoms']
            logging.info("Data cleaning done and text created")
            text = gender + age + occupation + travel_history + symptoms + food + extra_info
            return(text)

        except Exception as e:
            raise CustomExeception(e, sys)
        
    def clean_occupation_pipeline(occ):
        try:
            allow_list = {
                'accountant', 'architect', 'artist', 'auditor', 'barista', 'business analyst',
                'carpenter', 'chef', 'civil engineer', 'content writer', 'construction worker',
                'data scientist', 'database administrator', 'dentist', 'devops engineer',
                'doctor', 'electrician', 'firefighter', 'financial analyst', 'flight attendant',
                'graphic designer', 'hr specialist', 'hvac technician', 'illustrator', 'lawyer',
                'marketing manager', 'mason', 'mechanic', 'medical assistant', 'nurse',
                'operations manager', 'paramedic', 'pharmacist', 'photographer',
                'physical therapist', 'physician assistant', 'plumber', 'police officer',
                'project manager', 'real estate agent', 'registered nurse', 'sales representative',
                'software engineer', 'systems analyst', 'teacher', 'ui/ux designer',
                'veterinarian', 'video editor', 'web developer', 'welder', 'Chief Executive Officer',
                'Chief Operating Officer ', 'Vice President', 'Director', 'Manager',
                'Team Lead', 'Supervisor', 'Project Manager', 'Engineer', 'Analyst', 'Specialist',
                'Consultant', 'Coordinator', 'Associate', 'Assistant', 'Representative'
            }
            deny_list = [
                'declined to answer', 'disabled', 'garbage', 'homemaker',
                'inmate', 'n/a', 'none', 'not applicable', 'not specified', 'not working',
                'patient', 'refused', 'retired', 'seeking employment', 'self-employed',
                'student', 'stay at home mom/dad', 'trying to conceive', 'unemployed',
                'unknown'
            ]
            if not isinstance(occ, str) or not occ.strip():
                return ("", occ)

            occ_lower = occ.lower()

            best_deny_match, deny_score = process.extractOne(occ_lower, deny_list, scorer=fuzz.token_set_ratio)
            if deny_score > 85:
                return ("", occ)

            if occ_lower in allow_list:
                return (occ, np.nan)

            best_allow_match, allow_score = process.extractOne(occ_lower, allow_list)
            if allow_score > 90:
                return (best_allow_match.title(), np.nan)

            return ("", occ)
        
        except Exception as e:
            raise CustomExeception(e, sys)