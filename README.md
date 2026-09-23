# Human Activity Recognition using Machine Learning

A machine-learning-based Human Activity Recognition (HAR) system that
classifies human activities using smartphone sensor data. The project
uses accelerometer and gyroscope-derived features and compares multiple
classical machine-learning algorithms.

## Project Overview

Human Activity Recognition (HAR) is the process of automatically
identifying a person's physical activity from sensor measurements.

This project classifies six activities:

-   Walking
-   Walking Upstairs
-   Walking Downstairs
-   Sitting
-   Standing
-   Laying

### Workflow

``` text
Smartphone Sensor Data
        ↓
Data Loading & Inspection
        ↓
Feature Preparation
        ↓
Subject-wise Train/Test Split
        ↓
Feature Scaling
        ↓
Model Training
        ↓
Model Comparison
        ↓
Model Evaluation
        ↓
Feature Importance Analysis
```

## Objectives

-   Use smartphone accelerometer and gyroscope data for activity
    recognition.
-   Prepare and analyze sensor-derived features.
-   Reduce data leakage by splitting data based on subjects.
-   Train and compare multiple machine-learning algorithms.
-   Evaluate models using accuracy, precision, recall, F1-score, and a
    confusion matrix.
-   Identify important sensor features using Random Forest feature
    importance.

## Technologies Used

-   Python
-   NumPy
-   Pandas
-   Scikit-learn
-   Matplotlib
-   Jupyter Notebook

## Sensors

### Accelerometer

The accelerometer measures linear acceleration along the X, Y, and Z
axes. These measurements capture movement patterns of the smartphone.

### Gyroscope

The gyroscope measures rotational/angular movement around the X, Y, and
Z axes. It provides additional information about orientation and
movement.

Using both sensors provides complementary information for distinguishing
activities.

## Dataset

The notebook contains:

-   2,160 samples
-   47 columns
-   45 machine-learning features
-   1 subject identifier
-   1 activity/target column
-   6 activity classes

The features include sensor-derived characteristics such as mean,
standard deviation, minimum, maximum, energy, and other accelerometer
and gyroscope features.

The `activity` column is the target variable, while `subject` identifies
the person associated with each sample.

## Data Preparation

The project removes `subject` and `activity` from the feature matrix:

``` python
feature_cols = [c for c in df.columns if c not in ("subject", "activity")]
X = df[feature_cols]
y = df["activity"]
```

This produces 45 numerical input features.

### Subject-wise Train/Test Split

The project first splits unique subjects into training and testing
groups instead of randomly splitting individual rows.

``` text
Training: 1512 samples
Testing:   648 samples
```

This helps reduce data leakage and provides a more realistic evaluation
on subjects that were not used during training.

## Feature Scaling

The project uses `StandardScaler`:

``` python
scaler = StandardScaler()

X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)
```

The scaler is fitted only on training data and then applied to test
data.

## Machine Learning Models

### 1. Logistic Regression

Used as a baseline multiclass classification model.

``` python
LogisticRegression(
    max_iter=1000,
    random_state=42
)
```

### 2. Support Vector Machine

An SVM with an RBF kernel is used to model nonlinear relationships
between sensor features.

``` python
SVC(
    kernel="rbf",
    C=10,
    gamma="scale",
    random_state=42
)
```

### 3. Random Forest

Random Forest combines multiple decision trees.

``` python
RandomForestClassifier(
    n_estimators=200,
    random_state=42
)
```

The model uses 200 trees.

## Evaluation

The models are compared using test-set accuracy.

In this experiment, Random Forest achieved approximately **93% test
accuracy** and was the best-performing model among the three evaluated
models.

The Random Forest model is further evaluated using:

-   Precision
-   Recall
-   F1-score
-   Confusion matrix
-   Feature importance

### Classification Performance

The model performs particularly well on static activities such as
laying, sitting, and standing. Some confusion occurs between
walking-related activities because their sensor patterns are similar.

## Confusion Matrix

The confusion matrix compares actual and predicted activities.

-   Diagonal values represent correct predictions.
-   Off-diagonal values represent misclassifications.

A notable source of confusion is between:

-   Walking
-   Walking Upstairs
-   Walking Downstairs

These activities produce similar movement and sensor patterns.

## Feature Importance

Random Forest feature importance identifies sensor-derived features that
contribute most to classification.

Important features in the experiment include:

-   `acc_x_mean`
-   `acc_z_energy`
-   `gyro_z_std`
-   `acc_z_min`
-   `acc_x_max`
-   `acc_x_min`
-   `gyro_z_mad`
-   `acc_x_energy`
-   `gyro_z_energy`

Feature importance helps explain which accelerometer and gyroscope
characteristics are useful for recognizing activities.

## Project Structure

A typical structure is:

``` text
HAR_Model/
│
├── notebooks/
│   └── Human_Activity_Recognition.ipynb
│
├── src/
│   └── generate_data.py
│
├── data/
│   └── dataset files
│
├── README.md
└── requirements.txt
```

> Exact folder and file names may vary depending on the project version.

## Installation

### 1. Clone or download the project

``` bash
git clone <your-repository-url>
cd HAR_Model
```

### 2. Create a virtual environment

``` bash
python -m venv venv
```

Activate on macOS/Linux:

``` bash
source venv/bin/activate
```

Activate on Windows:

``` bash
venv\Scripts\activate
```

### 3. Install dependencies

``` bash
pip install numpy pandas scikit-learn matplotlib jupyter
```

Or:

``` bash
pip install -r requirements.txt
```

## Running the Project

Start Jupyter Notebook:

``` bash
jupyter notebook
```

or:

``` bash
jupyter lab
```

Open the HAR notebook and run the cells sequentially.

The notebook performs:

1.  Dataset loading
2.  Data inspection
3.  Activity distribution visualization
4.  Feature and label preparation
5.  Subject-wise train/test split
6.  Feature scaling
7.  Model training
8.  Model accuracy comparison
9.  Random Forest evaluation
10. Confusion matrix generation
11. Feature importance analysis

## Results

  Model                   Approximate Test Accuracy
  --------------------- ---------------------------
  Logistic Regression                         \~90%
  SVM with RBF Kernel                         \~90%
  Random Forest                               \~93%

Random Forest is selected in the notebook based on the highest measured
test accuracy in this experiment.

## Key Learnings

This project demonstrates:

-   Machine-learning classification
-   Sensor data processing
-   Feature engineering
-   Subject-wise dataset splitting
-   Data leakage prevention
-   Feature scaling
-   Logistic Regression
-   Support Vector Machines
-   Random Forest
-   Model comparison
-   Classification metrics
-   Confusion matrix analysis
-   Feature importance

## Future Enhancements

-   Collect real-time sensor data from a smartphone or wearable device.
-   Deploy the trained model as a web or mobile application.
-   Use raw time-series sensor windows.
-   Experiment with CNN, LSTM, and other deep-learning models.
-   Perform hyperparameter tuning.
-   Add more activity classes.
-   Build a real-time activity monitoring dashboard.

## Real-World Applications

-   Fitness tracking
-   Healthcare and elderly monitoring
-   Wearable devices
-   Smart homes
-   Activity monitoring systems
-   Mobile health applications
-   Assistive technologies


