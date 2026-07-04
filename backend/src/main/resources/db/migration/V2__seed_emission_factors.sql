-- Seed Emission Factors
INSERT INTO emission_factors (activity_type, unit, kg_co2e_per_unit, source, effective_date) VALUES
-- Transportation (Category: TRANSPORT)
('FLIGHT_SHORT_HAUL', 'km', 0.15, 'DEFRA 2023', '2023-01-01'),
('FLIGHT_LONG_HAUL', 'km', 0.12, 'DEFRA 2023', '2023-01-01'),
('CAR_PETROL', 'km', 0.18, 'EPA 2023', '2023-01-01'),
('CAR_DIESEL', 'km', 0.17, 'EPA 2023', '2023-01-01'),
('CAR_ELECTRIC', 'km', 0.05, 'EPA 2023 (Grid Avg)', '2023-01-01'),
('BUS', 'km', 0.08, 'DEFRA 2023', '2023-01-01'),
('TRAIN', 'km', 0.04, 'DEFRA 2023', '2023-01-01'),

-- Electricity (Category: ELECTRICITY)
('ELECTRICITY_GRID', 'kWh', 0.45, 'IEA 2023', '2023-01-01'),
('ELECTRICITY_SOLAR', 'kWh', 0.05, 'IPCC Lifecycle', '2023-01-01'),

-- Food (Category: FOOD)
('MEAL_VEGAN', 'meals', 0.50, 'Poore & Nemecek 2018', '2023-01-01'),
('MEAL_VEGETARIAN', 'meals', 1.20, 'Poore & Nemecek 2018', '2023-01-01'),
('MEAL_MEAT', 'meals', 3.00, 'Poore & Nemecek 2018', '2023-01-01'),
('MEAL_FISH', 'meals', 1.80, 'Poore & Nemecek 2018', '2023-01-01'),

-- Shopping (Category: SHOPPING)
('SHOPPING_CLOTHING', 'items', 15.00, 'WRAP 2023', '2023-01-01'),
('SHOPPING_ELECTRONICS', 'items', 80.00, 'Lifecycle Studies', '2023-01-01'),
('SHOPPING_FURNITURE', 'items', 50.00, 'Lifecycle Studies', '2023-01-01'),
('SHOPPING_GENERAL', 'kg', 2.00, 'Avg Waste/Goods', '2023-01-01')
ON CONFLICT (activity_type) DO NOTHING;

-- Seed Badges
INSERT INTO badges (name, description, trigger_type, threshold) VALUES
('7 Day Streak', 'Logged carbon activities for 7 consecutive days', 'STREAK_DAYS', 7.0),
('30 Day Streak', 'Logged carbon activities for 30 consecutive days', 'STREAK_DAYS', 30.0),
('First Goal', 'Successfully completed your first carbon reduction goal', 'GOAL_COMPLETED', 1.0),
('10 Kg Saved', 'Reduced carbon emissions by 10 kg', 'CARBON_SAVED', 10.0),
('25 Kg Saved', 'Reduced carbon emissions by 25 kg', 'CARBON_SAVED', 25.0),
('50 Kg Saved', 'Reduced carbon emissions by 50 kg', 'CARBON_SAVED', 50.0)
ON CONFLICT (name) DO NOTHING;
