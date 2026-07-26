-- Mapping factor_value based on typical standards (kg CO2e per unit)
-- Transportation (category_id = 1)
INSERT INTO `emission_factors` (`category_id`, `unit`, `factor_value`, `effective_from`) VALUES 
(1, 'km', 0.181500, '2020-01-01'); -- Consolidated average for car

-- Electricity (category_id = 2)
INSERT INTO `emission_factors` (`category_id`, `unit`, `factor_value`, `effective_from`) VALUES 
(2, 'kWh', 0.400000, '2020-01-01');

-- Fuel (category_id = 3)
INSERT INTO `emission_factors` (`category_id`, `unit`, `factor_value`, `effective_from`) VALUES 
(3, 'litres', 2.310000, '2020-01-01');

-- Food (category_id = 4)
INSERT INTO `emission_factors` (`category_id`, `unit`, `factor_value`, `effective_from`) VALUES 
(4, 'kg', 27.000000, '2020-01-01'); -- Beef average

-- Waste (category_id = 5)
INSERT INTO `emission_factors` (`category_id`, `unit`, `factor_value`, `effective_from`) VALUES 
(5, 'kg', 0.500000, '2020-01-01');

-- Water Usage (category_id = 6)
INSERT INTO `emission_factors` (`category_id`, `unit`, `factor_value`, `effective_from`) VALUES 
(6, 'litres', 0.001000, '2020-01-01');

-- Online Shopping (category_id = 7)
INSERT INTO `emission_factors` (`category_id`, `unit`, `factor_value`, `effective_from`) VALUES 
(7, 'items', 5.000000, '2020-01-01');

-- Travel (category_id = 8)
INSERT INTO `emission_factors` (`category_id`, `unit`, `factor_value`, `effective_from`) VALUES 
(8, 'nights', 15.000000, '2020-01-01');
