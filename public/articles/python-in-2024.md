@@Title: Writing python in 2024
@@URL: python-in-2024
@@Date: 1/15/2024
@@TLDR: there is too many ways, this is the right one
@@Tags: py
@@WordCount: 370
@@ReadEstimate: 9

A new year. Things change. I changed. Last year I thought "Wow! This Poetry thing is nice and everyone should get onboard."

I was wrong. I will keep the article up for reference, but we are done doing that.

## Back to venv

Poetry works well once configured but the bloat exceeds the benefits.

- Cumbersome to set up and configure correctly
- Does not play nice with certain libraries or tools (unacceptable)

In contrast, [venv](https://docs.python.org/3/library/venv.html) is:

- Widely used and easier to debug
- Compatible with a wider range of libraries and tools, all of them.
- Comes installed with Python

## Pre-setup

Before setting up a virtual environment, it's important to check which version of Python you have installed on your system. You can do this by running the following command in your terminal:

```sh
python --version
# Python 3.12.2
```

If you don't have Python installed, you can download and install the latest version from the [official Python website](https://www.python.org/).

### Setup

To set up a virtual environment using venv, follow these steps:

*Tip: Creating is not activating*

```sh
# Create a virtual environment
python -m venv venv

# Create venv with specific Python version
python -m venv --python=/path/to/python3.11.5 venv

# Activate virtual environment
source venv/bin/activate # Unix
.\venv\Scripts\activate.bat # Windows

# Deactivate venv
deactivate
```

### General Workflow

```sh
cd new_project
source venv/bin/activate
python -m pip install pandas
python main.py
```

## Prosper

Once you have activated the virtual environment, any packages or dependencies you install will only be available within that environment. This means you can safely test and develop your code without affecting other projects or the system Python installation.

