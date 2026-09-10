-- Standardize the profile location sentinel to the conventional N/A notation.
UPDATE public.profiles
SET city = 'N/A'
WHERE city = 'NA';
