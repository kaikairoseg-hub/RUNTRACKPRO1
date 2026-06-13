/**
 * Fitness calculation utilities
 * Uses Mifflin-St Jeor BMR, Harris-Benedict TDEE, and MET-based calorie burn
 */

// MET values per activity type (Metabolic Equivalent of Task)
const MET = {
  Running: 9.8,   // ~10 km/h moderate run
  Cycling: 7.5,   // moderate cycling ~16-19 km/h
  Walking: 3.8,   // brisk walk
  Hiking:  6.0,   // uphill hiking
};

/**
 * Calculate BMI
 * @param {number} weightKg
 * @param {number} heightCm
 * @returns {{ value: number, category: string, color: string }}
 */
export function calcBMI(weightKg, heightCm) {
  if (!weightKg || !heightCm) return null;
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  const value = Math.round(bmi * 10) / 10;

  let category, color;
  if (bmi < 18.5)      { category = "Underweight"; color = "#3b82f6"; }
  else if (bmi < 25)   { category = "Normal";       color = "#10b981"; }
  else if (bmi < 30)   { category = "Overweight";   color = "#f59e0b"; }
  else                  { category = "Obese";         color = "#ef4444"; }

  return { value, category, color };
}

/**
 * Calculate BMR using Mifflin-St Jeor equation (kcal/day)
 * @param {number} weightKg
 * @param {number} heightCm
 * @param {number} age
 * @param {'male'|'female'|'other'} gender
 */
export function calcBMR(weightKg, heightCm, age, gender) {
  if (!weightKg || !heightCm || !age) return null;
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return gender === 'female' ? base - 161 : base + 5;
}

// Activity multipliers for TDEE
const TDEE_MULTIPLIERS = {
  sedentary:   1.2,
  light:       1.375,
  moderate:    1.55,
  active:      1.725,
  very_active: 1.9,
};

/**
 * Calculate TDEE (Total Daily Energy Expenditure) kcal/day
 */
export function calcTDEE(weightKg, heightCm, age, gender, activityLevel = 'moderate') {
  const bmr = calcBMR(weightKg, heightCm, age, gender);
  if (!bmr) return null;
  return Math.round(bmr * (TDEE_MULTIPLIERS[activityLevel] ?? 1.55));
}

/**
 * Calculate daily calorie target based on weight goal
 * lose:     TDEE - 500 (≈ 0.5 kg/week loss)
 * maintain: TDEE
 * gain:     TDEE + 300
 */
export function calcDailyCalorieTarget(weightKg, heightCm, age, gender, activityLevel, weightGoal) {
  const tdee = calcTDEE(weightKg, heightCm, age, gender, activityLevel);
  if (!tdee) return null;
  if (weightGoal === 'lose')   return tdee - 500;
  if (weightGoal === 'gain')   return tdee + 300;
  return tdee;
}

/**
 * Calculate calories burned during an activity using MET formula
 * Calories = MET × weight(kg) × duration(hours)
 *
 * Falls back to distance-based estimate (70 kcal/km) if no weight provided
 *
 * @param {number} distanceKm
 * @param {number} durationSeconds
 * @param {string} activityType  Running | Cycling | Walking | Hiking
 * @param {number|null} weightKg
 * @returns {number} calories burned (integer)
 */
export function calcCalories(distanceKm, durationSeconds, activityType, weightKg) {
  if (weightKg && durationSeconds > 0) {
    const met = MET[activityType] ?? 6;
    const hours = durationSeconds / 3600;
    return Math.round(met * weightKg * hours);
  }
  // Fallback: rough 70 kcal/km
  return Math.round(distanceKm * 70);
}

/**
 * Recommend daily steps based on weight goal and fitness level
 * WHO baseline: 8,000 steps/day
 * Extra for weight loss: ~2,000-3,000 more
 */
export function calcDailyStepsGoal(weightGoal, activityLevel) {
  const base = {
    sedentary:   6000,
    light:       7000,
    moderate:    8000,
    active:      10000,
    very_active: 12000,
  }[activityLevel] ?? 8000;

  const bonus = weightGoal === 'lose' ? 2000 : weightGoal === 'gain' ? -1000 : 0;
  return Math.max(4000, base + bonus);
}

/**
 * Estimate daily steps from distance walked/run (1 km ≈ 1,312 steps)
 */
export function kmToSteps(km) {
  return Math.round(km * 1312);
}

/**
 * Estimate how many kg can be lost per week at current calorie deficit
 */
export function weeklyWeightLoss(tdee, dailyCalorieIntake) {
  const deficit = tdee - dailyCalorieIntake;
  if (deficit <= 0) return 0;
  // 7,700 kcal = 1 kg of fat
  return Math.round((deficit * 7 / 7700) * 100) / 100;
}

/**
 * Format BMI bar position (0–100%) clamped between 15–40 BMI range
 */
export function bmiBarPercent(bmi) {
  const min = 15, max = 40;
  return Math.min(100, Math.max(0, ((bmi - min) / (max - min)) * 100));
}
