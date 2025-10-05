from setuptools import find_packages, setup
from typing import List

def get_requirements(path : str) -> List[str]:
    '''returns a list of requirement'''

    requirements = []
    with open(path) as obj:
        requirements = obj.readlines()
        requirements = [req.replace("\n", "") for req in requirements]

        if "-e ." in requirements:
            requirements.remove('-e .')
    
    return requirements



setup(
    name='STC_PROJECT_25',
    version = '0.0.1',
    author = 'Atharva',
    packages=find_packages(),
    install_requires = get_requirements('requirement.txt')
     
    )