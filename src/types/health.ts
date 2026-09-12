/**
 * Real Health Telemetry Contracts (Zero Fake Data)
 * Standardized risk terminology across Web, Android, and ESP32:
 * - NORMAL
 * - WATCH
 * - WARNING
 * - CRITICAL
 * - EMERGENCY
 */

export type RiskLevel = "NORMAL" | "WATCH" | "WARNING" | "CRITICAL" | "EMERGENCY";

export type SignalQuality = "OPTIMAL" | "DEGRADED" | "UNRELIABLE" | "NO_SIGNAL";

export type MovementState = "RESTING" | "LOW_ACTIVITY" | "ACTIVE" | "UNKNOWN";

export type OverallDataQuality = "GOOD" | "FAIR" | "POOR" | "ERROR";

export type BaselineReadiness = "BASELINE_NOT_READY" | "BASELINE_BUILDING" | "BASELINE_READY" | "BASELINE_STALE";

export interface PersonalBaseline {
  deviceId: string;
  status: BaselineReadiness;
  sampleCount: number;
  rejectedSampleCount?: number;
  minSamplesRequired: number;
  restingHeartRate: number | null;
  restingSpo2: number | null;
  lastUpdatedAt: number | null;
  staleThresholdMs: number;
}

export interface ContextSnapshot {
  timestamp: number;
  heartRate: number | null;
  heartRateStatus: "VALID" | "LOW_QUALITY" | "INVALID" | "ERROR";
  spo2: number | null;
  spo2Status: "VALID" | "LOW_QUALITY" | "INVALID" | "ERROR";
  ambientTemperature: number | null;
  humidity: number | null;
  movementState: MovementState;
  accelerationMagnitude: number | null;
  gyroActivity: number | null;
  ppgQuality: "GOOD" | "FAIR" | "POOR" | "ERROR";
  overallDataQuality: OverallDataQuality;
  baselineStatus: BaselineReadiness;
  baselineSampleCount: number;
  baselineRejectedCount?: number;
  baselineUpdatedAt: number | null;
  heartRateBaseline: number | null;
  spo2Baseline: number | null;
  heartRateDelta: number | null;
  spo2Delta: number | null;
}

export interface HealthTelemetry {
  /** Beats per minute (numeric estimate or null when unavailable/degraded) */
  heartRate?: number | null;
  /** Blood oxygen saturation percentage estimate (numeric estimate or null when unavailable) */
  spo2?: number | null;
  /** Peripheral skin temperature in Celsius */
  skinTemp?: number;
  /** Ambient environmental temperature in Celsius */
  ambientTemp?: number;
  /** Current detected movement / posture state */
  activityState?: MovementState | "Resting" | "Walking" | "Active" | "Recovery";
  /** Standardized clinical triage risk tier */
  riskLevel?: RiskLevel;
  /** Heart rate variability (RMSSD ms) */
  hrvMs?: number;
  /** Optical PPG / motion sensor signal validity */
  signalQuality?: SignalQuality;
  /** Millisecond unix timestamp of measurement */
  timestamp: number;

  // --- Hardware / Wokwi Simulation Sensor Fields ---
  deviceId?: string;
  temperature?: number | null;
  humidity?: number | null;
  accelX?: number | null;
  accelY?: number | null;
  accelZ?: number | null;
  accelMagnitude?: number | null;
  gyroX?: number | null;
  gyroY?: number | null;
  gyroZ?: number | null;
  dhtStatus?: "VALID" | "INVALID" | "STALE";
  imuStatus?: "VALID" | "ERROR";
  // --- MAX30102 Simulated PPG / Development Estimates ---
  hrStatus?: "VALID" | "LOW_QUALITY" | "INVALID" | "ERROR";
  spo2Status?: "VALID" | "LOW_QUALITY" | "INVALID" | "ERROR";
  ppgQuality?: "GOOD" | "FAIR" | "POOR" | "ERROR";
  source?: "WOKWI_SIMULATION" | "PHYSICAL_DEVICE";

  // --- Step 5 Context & Personal Baseline Fields ---
  movementState?: MovementState;
  overallDataQuality?: OverallDataQuality;
  gyroActivity?: number | null;
  baselineStatus?: BaselineReadiness;
  baselineSampleCount?: number;
  baselineRejectedCount?: number;
  baselineUpdatedAt?: number | null;
  heartRateBaseline?: number | null;
  spo2Baseline?: number | null;
  heartRateDelta?: number | null;
  spo2Delta?: number | null;

  // --- Step 6 Sensor-Driven Risk Engine Fields ---
  risk?: RiskResult;

  // --- Step 7 Fall Detection Subsystem Fields ---
  fallState?: FallState;
  fallEvent?: FallEvent | null;
}

export type FallState =
  | "IDLE"
  | "IMPACT_CANDIDATE"
  | "POST_IMPACT_MONITORING"
  | "FALL_SUSPECTED"
  | "FALL_CONFIRMED"
  | "CANCELLED"
  | "COOLDOWN"
  | "UNAVAILABLE";

export interface FallEvidence {
  timestamp: number;
  peakAcceleration: number | null;
  orientationChangeDeg: number | null;
  inactivityDurationMs: number;
  gyroActivity: number | null;
  preOrientation: [number, number, number] | null;
  postOrientation: [number, number, number] | null;
  activityState: string;
  sensorQuality: string;
  cancellationReason?: string;
  confirmationReason?: string;
}

export interface FallEvent {
  id: string;
  deviceId: string;
  timestamp: number;
  state: FallState;
  peakAcceleration: number | null;
  orientationChangeDeg: number | null;
  inactivityDurationMs: number;
  gyroActivity: number | null;
  activityState: string;
  confidenceOrScore: number | null;
  evidence: FallEvidence;
  sensorQuality: string;
  detectorVersion: string; // "fall-rule-v0.1"
  alertActive: boolean;
}

export type RiskState = 
  | "INSUFFICIENT_DATA" 
  | "NORMAL" 
  | "WATCH" 
  | "WARNING" 
  | "CRITICAL" 
  | "EMERGENCY"; // RESERVED FOR FUTURE EMERGENCY WORKFLOW

export type DominantRisk = 
  | "HEAT" 
  | "CARDIOVASCULAR" 
  | "RESPIRATORY" 
  | "FATIGUE" 
  | "FALL" 
  | "NONE" 
  | "UNKNOWN";

export type RiskQuality = "GOOD" | "FAIR" | "POOR" | "INSUFFICIENT";

export type RiskTrajectoryDirection = "RISING" | "STABLE" | "FALLING";

export interface RiskTrajectory {
  current: number | null;
  slope: number | null;
  persistenceSeconds: number;
  direction: RiskTrajectoryDirection;
}

export interface StructuredRiskFactor {
  factor: string;
  current: number | string | null;
  baseline?: number | string | null;
  delta?: number | string | null;
  unit?: string;
  direction?: "ABOVE_BASELINE" | "BELOW_BASELINE" | "ELEVATED" | "DEGRADED" | "NORMAL";
}

/**
 * Step 6 Rule-Based Risk Engine Output Model (rule-v0.1)
 * Relative risk indicator scores on a [0.0, 1.0] development scale.
 * Note: These are algorithmic risk indicators, NOT calibrated clinical disease probabilities.
 */
export interface RiskResult {
  deviceId: string;
  timestamp: number;
  heatRisk: number | null;
  cardiovascularRisk: number | null;
  respiratoryRisk: number | null;
  fatigueRisk: number | null;
  fallRisk: number | null;
  overallRisk: number | null;
  confidence: number | null;
  dominantRisk: DominantRisk;
  state: RiskState;
  contributingFactors: string[];
  structuredFactors?: StructuredRiskFactor[];
  quality: RiskQuality;
  trajectory?: RiskTrajectory;
  algorithmVersion: string; // "rule-v0.1"
}

export type TelemetryStateStatus = 
  | "LOADING"
  | "EMPTY"
  | "CONNECTED"
  | "DISCONNECTED"
  | "STALE"
  | "ERROR"
  | "UNAUTHORIZED";

export type TelemetryFreshness = 
  | "LIVE"
  | "STALE"
  | "OFFLINE"
  | "WAITING_FOR_DATA"
  | "ERROR";

export interface TelemetryState {
  status: TelemetryStateStatus;
  data: HealthTelemetry | null;
  error?: string;
  lastUpdated?: number;
}


export type HistoryRange = "1m" | "5m" | "30m";

export interface TelemetryHistoryPoint {
  timestamp: number;
  value: number | null;
  status?: string;
}

export interface HistoricalTelemetryState {
  status: "LOADING" | "SUCCESS" | "EMPTY" | "ERROR" | "WAITING_FOR_DATA";
  records: HealthTelemetry[];
  range: HistoryRange;
  error?: string;
  lastFetched?: number;
}

