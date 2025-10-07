import pandas as pd
import numpy as np
from src.exception import CustomExeception
from src.logger import logging
import os
import sys
from dataclasses import dataclass
import re
from thefuzz import process, fuzz
from datasets import load_dataset, Features, ClassLabel, Value, Dataset
import evaluate
from transformers import AutoTokenizer

@dataclass
class DataTransformationConfig:
    preprocessor_obj_file_path = os.path.join('artifects', 'preprocessor.pkl')

class DataTranformation:

    def __init__(self):
        self.data_transformation_config = DataTransformationConfig()
    
    def clean_and_deduplicate_foods(log_string):
        if isinstance(log_string, float) and np.isnan(log_string):
            log_string = ""

        # cleaned_string = re.sub(r"Day 1:", "", log_string)
        # cleaned_string = re.sub(r"; Day \d+:", ",", cleaned_string)
        # cleaned_string = re.sub(r"\.", "", cleaned_string)

        food_items = [item.strip() for item in log_string.split(',')]

        unique_items = list(dict.fromkeys(item for item in food_items if item))

        final_string = ", ".join(unique_items)
        return f", Food Eaten in Last 5 Days {final_string}"
    
    def clean_occupation_pipeline(occ, allow_set, deny_list):
        if not isinstance(occ, str) or not occ.strip():
            return ("", occ)

        occ_lower = occ.lower()

        best_deny_match, deny_score = process.extractOne(occ_lower, deny_list, scorer=fuzz.token_set_ratio)
        if deny_score > 85:
            return ("", occ)

        if occ_lower in allow_set:
            return (occ, np.nan)

        best_allow_match, allow_score = process.extractOne(occ_lower, allow_set)
        if allow_score > 90:
            return (best_allow_match.title(), np.nan)

        return ("", occ)
    
    def process_occupations(df):
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

        results = df['Occupation'].apply(
            lambda occ: clean_occupation_pipeline(occ, allow_list, deny_list)
        )

        temp_results_df = pd.DataFrame(
            results.tolist(),
            index=df.index,
            columns=['Occupation_Cleaned', 'Extra Info_Temp']
        )

        df['Extra Info'] = temp_results_df['Extra Info_Temp']
        df['Occupation'] = temp_results_df['Occupation_Cleaned']

        return df