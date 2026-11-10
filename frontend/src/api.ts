const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";
const TOKEN_KEY = "krishok-token";

export type Farmer = {
  id: string;
  name: string;
  phone_number: string;
  location: string;
  preferred_language: "bn" | "en";
};

export type Diagnosis = {
  id: string;
  crop_id?: string | null;
  disease_name: string;
  confidence: number;
  severity: string;
  medicine: string;
  dosage: string;
  advice_language: string;
  created_at: string;
  demo_result?: boolean;
  cause?: string;
  organic_treatment?: string;
  prevention?: string;
  safety_alert?: string;
  pathogen?: string;
  is_healthy?: boolean;
};

export type Crop = {
  id: string;
  crop_type: string;
  planting_date: string | null;
  created_at: string;
};

export type District = {
  id: string;
  name_en: string;
  name_bn: string;
  lat: number;
  lon: number;
  zone: string;
};

export type Commodity = {
  id: string;
  name_en: string;
  name_bn: string;
  base_price: number;
};

export type Weather = {
  district?: string;
  district_id?: string;
  zone?: string;
  temperature_c: number;
  feels_like_c: number;
  temp_max_c?: number;
  temp_min_c?: number;
  description: string;
  humidity: number;
  rain_probability: number | null;
  wind_speed_kmh?: number;
  weather_code?: number;
  spray_status?: string;
  spray_advisory?: string;
  irrigation_advisory?: string;
  fog_alert?: string;
  forecast: {
    date: string;
    temperature_max_c: number;
    temperature_min_c: number;
    precipitation_probability: number | null;
    precipitation_mm: number;
    description?: string;
  }[];
  advisory: string;
  source: string;
  updated_at?: string;
};

export type Market = {
  crop: string;
  crop_id?: string;
  location: string;
  currency: string;
  unit: string;
  current_price: number;
  farmgate_price?: number;
  wholesale_price?: number;
  retail_price?: number;
  change_pct?: number;
  history: { date: string; price_bdt_per_kg: number }[];
  outlook: string;
  trend: "rising" | "falling" | "stable" | "uncertain";
  confidence: number;
  forecast_horizon_days: number;
  drivers: string[];
  storage_advice?: string;
  trading_hubs?: string[];
  caveats: string;
  articles: { title: string; url: string; published_at: string }[];
  is_estimate: boolean;
  source: string;
  updated_at?: string;
};

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function saveToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (!(init.body instanceof FormData))
    headers.set("Content-Type", "application/json");
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const response = await fetch(`${API_BASE}${path}`, { ...init, headers });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(payload.detail || `Request failed (${response.status})`);
  return payload as T;
}

export async function authenticate(
  mode: "login" | "register",
  fields: Record<string, string>,
) {
  const result = await request<{ access_token: string; farmer: Farmer }>(
    `/auth/${mode}`,
    {
      method: "POST",
      body: JSON.stringify(fields),
    },
  );
  saveToken(result.access_token);
  return result.farmer;
}

export function fetchProfile() {
  return request<Farmer>("/profile");
}

export function fetchCrops() {
  return request<Crop[]>("/crops");
}

export function addCrop(crop_type: string) {
  return request<Crop>("/crops", {
    method: "POST",
    body: JSON.stringify({ crop_type }),
  });
}

export function diagnose(
  image: File,
  language: "bn" | "en",
  cropId?: string,
  cropHint?: string,
) {
  const form = new FormData();
  form.set("image", image);
  form.set("language", language);
  if (cropId) form.set("crop_id", cropId);
  if (cropHint) form.set("crop_hint", cropHint);
  return request<Diagnosis>("/diagnoses", { method: "POST", body: form });
}

export function fetchHistory() {
  return request<Diagnosis[]>("/diagnoses");
}

export function fetchDistricts() {
  return request<District[]>("/districts");
}

export function fetchCommodities() {
  return request<Commodity[]>("/market/commodities");
}

export type WeatherParams = {
  lat?: number;
  lon?: number;
  district?: string;
  language?: "bn" | "en";
};

export function fetchWeather(
  paramsOrLat?: WeatherParams | number,
  lon?: number,
  language: "bn" | "en" = "bn",
) {
  const query = new URLSearchParams();
  if (typeof paramsOrLat === "object" && paramsOrLat !== null) {
    if (paramsOrLat.lat !== undefined) query.set("lat", String(paramsOrLat.lat));
    if (paramsOrLat.lon !== undefined) query.set("lon", String(paramsOrLat.lon));
    if (paramsOrLat.district) query.set("district", paramsOrLat.district);
    query.set("language", paramsOrLat.language || "bn");
  } else {
    if (paramsOrLat !== undefined) query.set("lat", String(paramsOrLat));
    if (lon !== undefined) query.set("lon", String(lon));
    query.set("language", language);
  }
  return request<Weather>(`/weather?${query}`);
}

export type MarketParams = {
  crop?: string;
  location?: string;
  language?: "bn" | "en";
};

export function fetchMarket(
  paramsOrCrop?: MarketParams | string,
  language: "bn" | "en" = "bn",
  location?: string,
) {
  const query = new URLSearchParams();
  if (typeof paramsOrCrop === "object" && paramsOrCrop !== null) {
    if (paramsOrCrop.crop) query.set("crop", paramsOrCrop.crop);
    if (paramsOrCrop.location) query.set("location", paramsOrCrop.location);
    query.set("language", paramsOrCrop.language || "bn");
  } else {
    query.set("crop", paramsOrCrop || "rice");
    query.set("language", language);
    if (location) query.set("location", location);
  }
  return request<Market>(`/market?${query}`);
}
