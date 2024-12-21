--
-- PostgreSQL database dump
--

-- Dumped from database version 16.6
-- Dumped by pg_dump version 16.6

-- Started on 2024-12-20 13:30:05

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: providers; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.providers (id, name, service, rating, latitude, longitude)
VALUES (1, 'John''s Plumbing', 'Plumbing', 4.8, 51.5074, -0.1278),
       (2, 'Anna''s Tutoring', 'Tutoring', 4.5, 51.5094, -0.1357);

-- Reset the sequence for the providers table
SELECT pg_catalog.setval('public.providers_id_seq', 2, true);

-- Completed on 2024-12-20 13:30:05

--
-- PostgreSQL database dump complete
--
