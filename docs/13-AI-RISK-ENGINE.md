# AI Risk Engine

## Layers
1. Edge signal processing/TinyML
2. Risk engine and temporal fusion
3. LLM explanation

## Personal baseline
Track validated personal patterns such as resting HR, typical SpO2 and activity context.

## Risk inputs
- current measurements
- personal baseline
- activity
- environment
- recent trajectory
- sensor quality

## Modules
Heat risk, respiratory risk indicators, cardiovascular stress indicators, fatigue, fall detection and overall fusion.

## State machine
```text
NORMAL → WATCH → WARNING → CRITICAL → EMERGENCY
```

Use persistence, hysteresis, cooldown and quality checks.

Candidate models: logistic regression, trees, SVM, small CNN/GRU and anomaly detection.

Evaluate sensitivity, specificity, false-alert rate, calibration, latency, RAM/flash and power. Risk output is not a diagnosis.
