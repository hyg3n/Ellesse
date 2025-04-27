--
-- PostgreSQL database dump
--

-- Dumped from database version 16.6
-- Dumped by pg_dump version 16.6

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

DROP DATABASE IF EXISTS ellesse_db;
--
-- Name: ellesse_db; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE ellesse_db WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'English_United States.1252';


ALTER DATABASE ellesse_db OWNER TO postgres;

\connect ellesse_db

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
-- Name: postgis; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;


--
-- Name: EXTENSION postgis; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION postgis IS 'PostGIS geometry and geography spatial types and functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: bookings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bookings (
    id integer NOT NULL,
    user_id integer NOT NULL,
    provider_id integer NOT NULL,
    description text,
    status character varying(50) DEFAULT 'pending'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    provider_service_id integer NOT NULL,
    scheduled_at timestamp without time zone NOT NULL,
    payment_intent_id text
);


ALTER TABLE public.bookings OWNER TO postgres;

--
-- Name: bookings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.bookings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bookings_id_seq OWNER TO postgres;

--
-- Name: bookings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.bookings_id_seq OWNED BY public.bookings.id;


--
-- Name: chats; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chats (
    id integer NOT NULL,
    user1_id integer NOT NULL,
    user2_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.chats OWNER TO postgres;

--
-- Name: chats_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.chats_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.chats_id_seq OWNER TO postgres;

--
-- Name: chats_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.chats_id_seq OWNED BY public.chats.id;


--
-- Name: messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.messages (
    id integer NOT NULL,
    booking_id integer,
    sender_id integer NOT NULL,
    receiver_id integer,
    message text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    client_id text,
    chat_id integer,
    type character varying(50)
);


ALTER TABLE public.messages OWNER TO postgres;

--
-- Name: messages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.messages_id_seq OWNER TO postgres;

--
-- Name: messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.messages_id_seq OWNED BY public.messages.id;


--
-- Name: provider_services; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.provider_services (
    id integer NOT NULL,
    user_id integer,
    service_id integer,
    price numeric,
    extra json DEFAULT '{}'::json,
    experience integer DEFAULT 0 NOT NULL,
    availability json DEFAULT '[]'::json NOT NULL
);


ALTER TABLE public.provider_services OWNER TO postgres;

--
-- Name: provider_services_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.provider_services_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.provider_services_id_seq OWNER TO postgres;

--
-- Name: provider_services_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.provider_services_id_seq OWNED BY public.provider_services.id;


--
-- Name: service_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.service_categories (
    id integer NOT NULL,
    name text NOT NULL,
    icon_path text
);


ALTER TABLE public.service_categories OWNER TO postgres;

--
-- Name: service_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.service_categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.service_categories_id_seq OWNER TO postgres;

--
-- Name: service_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.service_categories_id_seq OWNED BY public.service_categories.id;


--
-- Name: services; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.services (
    id integer NOT NULL,
    name text NOT NULL,
    category_id integer
);


ALTER TABLE public.services OWNER TO postgres;

--
-- Name: services_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.services_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.services_id_seq OWNER TO postgres;

--
-- Name: services_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.services_id_seq OWNED BY public.services.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    phone_number text NOT NULL,
    password text NOT NULL,
    role text NOT NULL,
    rating numeric,
    latitude numeric,
    longitude numeric,
    avatar_url text,
    address text
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: bookings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings ALTER COLUMN id SET DEFAULT nextval('public.bookings_id_seq'::regclass);


--
-- Name: chats id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chats ALTER COLUMN id SET DEFAULT nextval('public.chats_id_seq'::regclass);


--
-- Name: messages id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages ALTER COLUMN id SET DEFAULT nextval('public.messages_id_seq'::regclass);


--
-- Name: provider_services id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.provider_services ALTER COLUMN id SET DEFAULT nextval('public.provider_services_id_seq'::regclass);


--
-- Name: service_categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_categories ALTER COLUMN id SET DEFAULT nextval('public.service_categories_id_seq'::regclass);


--
-- Name: services id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.services ALTER COLUMN id SET DEFAULT nextval('public.services_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: bookings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bookings (id, user_id, provider_id, description, status, created_at, updated_at, provider_service_id, scheduled_at, payment_intent_id) FROM stdin;
46	13	1	Kitchen sink leak	pending	2025-04-27 22:03:04.081355	2025-04-27 22:03:04.081355	81	2025-04-28 22:03:04.081355	\N
47	13	2	Install new light fixture	pending	2025-04-27 22:03:04.081355	2025-04-27 22:03:04.081355	82	2025-04-30 22:03:04.081355	\N
48	13	3	Garden hedge trim	accepted	2025-04-27 22:03:04.081355	2025-04-27 22:03:04.081355	83	2025-04-25 22:03:04.081355	\N
49	13	4	TV wall mount	accepted	2025-04-27 22:03:04.081355	2025-04-27 22:03:04.081355	84	2025-04-22 22:03:04.081355	\N
50	13	5	Bathroom tiling	declined	2025-04-27 22:03:04.081355	2025-04-27 22:03:04.081355	89	2025-04-29 22:03:04.081355	\N
51	13	6	Laptop repair	declined	2025-04-27 22:03:04.081355	2025-04-27 22:03:04.081355	96	2025-04-26 22:03:04.081355	\N
52	13	7	Garden seating build	completed	2025-04-27 22:03:04.081355	2025-04-27 22:03:04.081355	99	2025-04-17 22:03:04.081355	\N
53	13	8	Mount shelves	completed	2025-04-27 22:03:04.081355	2025-04-27 22:03:04.081355	102	2025-04-20 22:03:04.081355	\N
55	2	13	Clean gutters	pending	2025-04-27 22:03:04.081355	2025-04-27 22:03:04.081355	114	2025-05-02 22:03:04.081355	\N
56	3	13	Install shower head	accepted	2025-04-27 22:03:04.081355	2025-04-27 22:03:04.081355	146	2025-04-24 22:03:04.081355	\N
57	4	13	Assemble IKEA desk	accepted	2025-04-27 22:03:04.081355	2025-04-27 22:03:04.081355	148	2025-04-23 22:03:04.081355	\N
58	5	13	Drone repair	declined	2025-04-27 22:03:04.081355	2025-04-27 22:03:04.081355	150	2025-05-03 22:03:04.081355	\N
59	6	13	Home network setup	declined	2025-04-27 22:03:04.081355	2025-04-27 22:03:04.081355	182	2025-04-25 22:03:04.081355	\N
60	7	13	Garden pond maintenance	completed	2025-04-27 22:03:04.081355	2025-04-27 22:03:04.081355	184	2025-04-19 22:03:04.081355	\N
61	8	13	Mount TV and hide cables	completed	2025-04-27 22:03:04.081355	2025-04-27 22:03:04.081355	186	2025-04-15 22:03:04.081355	\N
62	13	1	Kitchen sink leak	pending	2025-04-27 22:17:04.266182	2025-04-27 22:17:04.266182	81	2025-04-28 22:17:04.266182	\N
63	13	2	Install new light fixture	pending	2025-04-27 22:17:04.266182	2025-04-27 22:17:04.266182	82	2025-04-30 22:17:04.266182	\N
64	13	3	Garden hedge trim	accepted	2025-04-27 22:17:04.266182	2025-04-27 22:17:04.266182	83	2025-04-25 22:17:04.266182	\N
65	13	4	TV wall mount	accepted	2025-04-27 22:17:04.266182	2025-04-27 22:17:04.266182	84	2025-04-22 22:17:04.266182	\N
66	13	5	Bathroom tiling	declined	2025-04-27 22:17:04.266182	2025-04-27 22:17:04.266182	89	2025-04-29 22:17:04.266182	\N
67	13	6	Laptop repair	declined	2025-04-27 22:17:04.266182	2025-04-27 22:17:04.266182	96	2025-04-26 22:17:04.266182	\N
68	13	7	Garden seating build	completed	2025-04-27 22:17:04.266182	2025-04-27 22:17:04.266182	99	2025-04-17 22:17:04.266182	\N
69	13	8	Mount shelves	completed	2025-04-27 22:17:04.266182	2025-04-27 22:17:04.266182	102	2025-04-20 22:17:04.266182	\N
71	2	13	Clean gutters	pending	2025-04-27 22:17:04.266182	2025-04-27 22:17:04.266182	114	2025-05-02 22:17:04.266182	\N
72	3	13	Install shower head	accepted	2025-04-27 22:17:04.266182	2025-04-27 22:17:04.266182	146	2025-04-24 22:17:04.266182	\N
73	4	13	Assemble IKEA desk	accepted	2025-04-27 22:17:04.266182	2025-04-27 22:17:04.266182	148	2025-04-23 22:17:04.266182	\N
74	5	13	Drone repair	declined	2025-04-27 22:17:04.266182	2025-04-27 22:17:04.266182	150	2025-05-03 22:17:04.266182	\N
75	6	13	Home network setup	declined	2025-04-27 22:17:04.266182	2025-04-27 22:17:04.266182	182	2025-04-25 22:17:04.266182	\N
76	7	13	Garden pond maintenance	completed	2025-04-27 22:17:04.266182	2025-04-27 22:17:04.266182	184	2025-04-19 22:17:04.266182	\N
77	8	13	Mount TV and hide cables	completed	2025-04-27 22:17:04.266182	2025-04-27 22:17:04.266182	186	2025-04-15 22:17:04.266182	\N
54	1	13	Paint bedroom walls	declined	2025-04-27 22:03:04.081355	2025-04-27 22:03:04.081355	112	2025-05-01 22:03:04.081355	\N
70	1	13	Paint bedroom walls	accepted	2025-04-27 22:17:04.266182	2025-04-27 22:17:04.266182	112	2025-05-01 22:17:04.266182	\N
\.


--
-- Data for Name: chats; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.chats (id, user1_id, user2_id, created_at, updated_at) FROM stdin;
1	2	13	2025-04-22 02:39:10.564014	2025-04-22 02:39:10.564014
2	3	13	2025-04-23 13:34:15.951948	2025-04-23 13:34:15.951948
3	6	13	2025-04-24 00:13:15.681722	2025-04-24 00:13:15.681722
4	2	14	2025-04-26 17:28:56.513597	2025-04-26 17:28:56.513597
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.messages (id, booking_id, sender_id, receiver_id, message, created_at, updated_at, client_id, chat_id, type) FROM stdin;
46	\N	13	2	Your booking request for 'Math Tutoring' has been sent.	2025-04-22 07:59:10.585119	2025-04-22 07:59:10.585119	\N	1	system
47	\N	13	3	Your booking request for 'Wi-Fi Setup' has been sent.	2025-04-23 13:34:15.99458	2025-04-23 13:34:15.99458	\N	2	system
48	\N	13	\N	hey	2025-04-23 13:34:30.025642	2025-04-23 13:34:30.025642	d13f9224-526c-4fbd-aab0-a9db65bd7807	2	user
49	\N	13	\N	hey hey	2025-04-23 14:26:05.590465	2025-04-23 14:26:05.590465	733f9de5-cd49-4874-bacc-2e083f61dbfc	1	user
50	\N	13	2	Your booking request for 'College Prep' has been sent.	2025-04-23 14:29:24.007587	2025-04-23 14:29:24.007587	\N	1	system
51	\N	13	6	Your booking request for 'Wi-Fi Setup' has been sent.	2025-04-24 00:13:15.709959	2025-04-24 00:13:15.709959	\N	3	system
52	\N	13	\N	hey	2025-04-24 00:13:28.815047	2025-04-24 00:13:28.815047	59a2635f-0ca1-48ba-bbf1-a27d010e8971	3	user
53	\N	14	2	Your booking request for 'Math Tutoring' has been sent.	2025-04-26 17:28:56.561299	2025-04-26 17:28:56.561299	\N	4	system
54	\N	14	\N	heyy	2025-04-26 17:59:26.382974	2025-04-26 17:59:26.382974	09685a39-1683-45e1-9237-18158f6a9f1f	4	user
55	\N	14	2	Your booking request for 'Homework Help' has been sent.	2025-04-27 17:03:57.421917	2025-04-27 17:03:57.421917	\N	4	system
56	\N	13	\N	I need it ASAP	2025-04-27 23:49:22.134251	2025-04-27 23:49:22.134251	15bbbf70-f357-46a6-a559-78ee08f00e8b	3	user
\.


--
-- Data for Name: provider_services; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.provider_services (id, user_id, service_id, price, extra, experience, availability) FROM stdin;
81	1	1	22.00	{}	2	[]
82	2	1	22.00	{}	2	[]
83	3	1	22.00	{}	2	[]
84	2	2	24.00	{}	3	[]
85	3	2	24.00	{}	3	[]
86	4	2	24.00	{}	3	[]
87	3	3	26.00	{}	4	[]
88	4	3	26.00	{}	4	[]
89	5	3	26.00	{}	4	[]
90	4	4	28.00	{}	5	[]
91	5	4	28.00	{}	5	[]
92	6	4	28.00	{}	5	[]
93	5	5	30.00	{}	1	[]
94	6	5	30.00	{}	1	[]
95	7	5	30.00	{}	1	[]
96	6	6	32.00	{}	2	[]
97	7	6	32.00	{}	2	[]
98	8	6	32.00	{}	2	[]
99	7	7	34.00	{}	3	[]
100	8	7	34.00	{}	3	[]
101	9	7	34.00	{}	3	[]
102	8	8	36.00	{}	4	[]
103	9	8	36.00	{}	4	[]
104	10	8	36.00	{}	4	[]
105	9	9	38.00	{}	5	[]
106	10	9	38.00	{}	5	[]
107	11	9	38.00	{}	5	[]
108	10	10	40.00	{}	1	[]
109	11	10	40.00	{}	1	[]
110	12	10	40.00	{}	1	[]
111	12	11	42.00	{}	2	[]
112	13	11	42.00	{}	2	[]
113	14	11	42.00	{}	2	[]
114	13	12	44.00	{}	3	[]
115	14	12	44.00	{}	3	[]
116	1	12	44.00	{}	3	[]
117	14	13	46.00	{}	4	[]
118	1	13	46.00	{}	4	[]
119	2	13	46.00	{}	4	[]
120	1	14	48.00	{}	5	[]
121	2	14	48.00	{}	5	[]
122	3	14	48.00	{}	5	[]
123	2	15	50.00	{}	1	[]
124	3	15	50.00	{}	1	[]
125	4	15	50.00	{}	1	[]
126	3	16	52.00	{}	2	[]
127	4	16	52.00	{}	2	[]
128	5	16	52.00	{}	2	[]
129	4	17	54.00	{}	3	[]
130	5	17	54.00	{}	3	[]
131	6	17	54.00	{}	3	[]
132	5	18	56.00	{}	4	[]
133	6	18	56.00	{}	4	[]
134	7	18	56.00	{}	4	[]
135	6	19	58.00	{}	5	[]
136	7	19	58.00	{}	5	[]
137	8	19	58.00	{}	5	[]
138	7	20	60.00	{}	1	[]
139	8	20	60.00	{}	1	[]
140	9	20	60.00	{}	1	[]
141	10	21	62.00	{}	2	[]
142	11	21	62.00	{}	2	[]
143	12	21	62.00	{}	2	[]
144	11	22	64.00	{}	3	[]
145	12	22	64.00	{}	3	[]
146	13	22	64.00	{}	3	[]
147	12	23	66.00	{}	4	[]
148	13	23	66.00	{}	4	[]
149	14	23	66.00	{}	4	[]
150	13	24	68.00	{}	5	[]
151	14	24	68.00	{}	5	[]
152	1	24	68.00	{}	5	[]
153	14	25	70.00	{}	1	[]
154	1	25	70.00	{}	1	[]
155	2	25	70.00	{}	1	[]
156	1	26	72.00	{}	2	[]
157	2	26	72.00	{}	2	[]
158	3	26	72.00	{}	2	[]
159	2	27	74.00	{}	3	[]
160	3	27	74.00	{}	3	[]
161	4	27	74.00	{}	3	[]
162	3	28	76.00	{}	4	[]
163	4	28	76.00	{}	4	[]
164	5	28	76.00	{}	4	[]
165	4	29	78.00	{}	5	[]
166	5	29	78.00	{}	5	[]
167	6	29	78.00	{}	5	[]
168	5	30	80.00	{}	1	[]
169	6	30	80.00	{}	1	[]
170	7	30	80.00	{}	1	[]
171	8	31	82.00	{}	2	[]
172	9	31	82.00	{}	2	[]
173	10	31	82.00	{}	2	[]
174	9	32	84.00	{}	3	[]
175	10	32	84.00	{}	3	[]
176	11	32	84.00	{}	3	[]
177	10	33	86.00	{}	4	[]
178	11	33	86.00	{}	4	[]
179	12	33	86.00	{}	4	[]
180	11	34	88.00	{}	5	[]
181	12	34	88.00	{}	5	[]
182	13	34	88.00	{}	5	[]
183	12	35	90.00	{}	1	[]
184	13	35	90.00	{}	1	[]
185	14	35	90.00	{}	1	[]
186	13	36	92.00	{}	2	[]
187	14	36	92.00	{}	2	[]
188	1	36	92.00	{}	2	[]
189	14	37	94.00	{}	3	[]
190	1	37	94.00	{}	3	[]
191	2	37	94.00	{}	3	[]
192	1	38	96.00	{}	4	[]
193	2	38	96.00	{}	4	[]
194	3	38	96.00	{}	4	[]
195	2	39	98.00	{}	5	[]
196	3	39	98.00	{}	5	[]
197	4	39	98.00	{}	5	[]
198	3	40	100.00	{}	1	[]
199	4	40	100.00	{}	1	[]
200	5	40	100.00	{}	1	[]
\.


--
-- Data for Name: service_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.service_categories (id, name, icon_path) FROM stdin;
1	Home Repairs & Installation	assets/icons/home_repairs.svg
2	Cleaning Services	assets/icons/cleaning.svg
3	Moving & Packing	assets/icons/moving_packing.svg
4	Gardening & Outdoor	assets/icons/gardening_outdoor.svg
6	Tutoring	assets/icons/tutoring.svg
7	Tech Help	assets/icons/tech_help.svg
8	Support & Errands	assets/icons/support_errands.svg
5	Beauty & Wellness	assets/icons/beauty_wellness.svg
\.


--
-- Data for Name: services; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.services (id, name, category_id) FROM stdin;
1	General Repairs	1
2	Plumbing	1
3	Electrical Repairs	1
4	Appliance Installation	1
5	TV Mounting	1
6	Furniture Assembly	1
7	Painting & Wall Repairs	1
8	Door Fixing	1
9	Caulking & Sealing	1
10	Regular Home Cleaning	2
11	Deep Cleaning	2
12	Carpet or Upholstery Cleaning	2
13	Moving Assistance	3
14	Packing Help	3
15	Heavy Lifting	3
16	Furniture Disassembly/Reassembly	3
17	Lawn Care	4
18	Weeding & Plant Care	4
19	Tree & Shrub Care	4
20	Outdoor Cleaning	4
21	Fancing Repair	4
22	Hair Styling	5
24	Makeup	5
25	Massage Therapy	5
26	Math Tutoring	6
27	Language Tutoring	6
28	College Prep	6
29	Homework Help	6
30	Science Help	6
31	Coding	6
32	Wi-Fi Setup	7
33	Device Setup & Troubleshooting	7
34	Software Help (e.g. installing apps, antivirus)	7
23	Manicure & Pedicure	5
35	Elderly Companion Visits	8
36	Disability Support (non-medical)	8
37	Dog Walking	8
38	Help with Paperwork	8
39	Pet Sitting	8
40	Babysitting	8
41	Helping with special needs children (non-professional)	8
\.


--
-- Data for Name: spatial_ref_sys; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spatial_ref_sys (srid, auth_name, auth_srid, srtext, proj4text) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, name, email, phone_number, password, role, rating, latitude, longitude, avatar_url, address) FROM stdin;
1	John Smith	john.smith@example.com	+1234567890	password123	user,provider	4.8	51.4763	-0.0351	\N	\N
2	Anna Brown	anna.brown@example.com	+1234567891	password123	user,provider	4.5	51.4745	-0.0375	\N	\N
3	Michael Davis	michael.davis@example.com	+1234567892	password123	user,provider	4.8	51.4780	-0.0368	\N	\N
4	Emily Wilson	emily.wilson@example.com	+1234567893	password123	user,provider	4.5	51.4739	-0.0362	\N	\N
5	David Johnson	david.johnson@example.com	+1234567894	password123	user,provider	4.0	51.4741	-0.0349	\N	\N
6	Sarah Miller	sarah.miller@example.com	+1234567895	password123	user,provider	4.7	51.4758	-0.0372	\N	\N
7	Robert Garcia	robert.garcia@example.com	+1234567896	password123	user,provider	4.9	51.4767	-0.0356	\N	\N
8	Jessica Martinez	jessica.martinez@example.com	+1234567897	password123	user,provider	4.3	51.4736	-0.0358	\N	\N
9	William Anderson	william.anderson@example.com	+1234567898	password123	user,provider	4.6	51.4749	-0.0369	\N	\N
10	Linda Thomas	linda.thomas@example.com	+1234567899	password123	user,provider	4.4	51.4772	-0.0371	\N	\N
11	Charles Taylor	charles.taylor@example.com	+1234567800	password123	user,provider	4.2	51.4747	-0.0352	\N	\N
12	Patricia Moore	patricia.moore@example.com	+1234567801	password123	user,provider	4.1	51.4761	-0.0360	\N	\N
14	alexa	a.jones@gmail.com	7374094715	$2b$10$FZ47N9CTmOqLGwWHIFsqReM8CqpuLxMLkG8FmJGt34KBIHgFkvTk.	user,provider	\N	\N	\N	\N	\N
13	john doe	john@gmail.com	07853569742	$2b$10$Ws.6G7Re3CT4uKlEmcCUkudEltmJZwuQQfTRlTbSj7ro6Bq4wp7dm	user,provider	\N	\N	\N	\N	Goldsmiths University
\.


--
-- Name: bookings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.bookings_id_seq', 77, true);


--
-- Name: chats_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.chats_id_seq', 4, true);


--
-- Name: messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.messages_id_seq', 56, true);


--
-- Name: provider_services_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.provider_services_id_seq', 200, true);


--
-- Name: service_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.service_categories_id_seq', 8, true);


--
-- Name: services_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.services_id_seq', 41, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 14, true);


--
-- Name: bookings bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_pkey PRIMARY KEY (id);


--
-- Name: chats chats_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chats
    ADD CONSTRAINT chats_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: provider_services provider_services_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.provider_services
    ADD CONSTRAINT provider_services_pkey PRIMARY KEY (id);


--
-- Name: service_categories service_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.service_categories
    ADD CONSTRAINT service_categories_pkey PRIMARY KEY (id);


--
-- Name: services services_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_pkey PRIMARY KEY (id);


--
-- Name: chats unique_chat_pair; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chats
    ADD CONSTRAINT unique_chat_pair UNIQUE (user1_id, user2_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: bookings bookings_provider_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_provider_service_id_fkey FOREIGN KEY (provider_service_id) REFERENCES public.provider_services(id);


--
-- Name: chats chats_user1_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chats
    ADD CONSTRAINT chats_user1_id_fkey FOREIGN KEY (user1_id) REFERENCES public.users(id);


--
-- Name: chats chats_user2_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chats
    ADD CONSTRAINT chats_user2_id_fkey FOREIGN KEY (user2_id) REFERENCES public.users(id);


--
-- Name: messages messages_chat_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_chat_id_fkey FOREIGN KEY (chat_id) REFERENCES public.chats(id);


--
-- Name: provider_services provider_services_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.provider_services
    ADD CONSTRAINT provider_services_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id);


--
-- Name: provider_services provider_services_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.provider_services
    ADD CONSTRAINT provider_services_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: services services_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.service_categories(id);


--
-- Name: TABLE bookings; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.bookings TO app_user;


--
-- Name: SEQUENCE bookings_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.bookings_id_seq TO app_user;


--
-- Name: TABLE chats; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.chats TO app_user;


--
-- Name: SEQUENCE chats_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.chats_id_seq TO app_user;


--
-- Name: TABLE geography_columns; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.geography_columns TO app_user;


--
-- Name: TABLE geometry_columns; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.geometry_columns TO app_user;


--
-- Name: TABLE messages; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.messages TO app_user;


--
-- Name: SEQUENCE messages_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.messages_id_seq TO app_user;


--
-- Name: TABLE provider_services; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.provider_services TO app_user;


--
-- Name: SEQUENCE provider_services_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.provider_services_id_seq TO app_user;


--
-- Name: TABLE service_categories; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.service_categories TO app_user;


--
-- Name: SEQUENCE service_categories_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.service_categories_id_seq TO app_user;


--
-- Name: TABLE services; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.services TO app_user;


--
-- Name: SEQUENCE services_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.services_id_seq TO app_user;


--
-- Name: TABLE spatial_ref_sys; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.spatial_ref_sys TO app_user;


--
-- Name: TABLE users; Type: ACL; Schema: public; Owner: postgres
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE public.users TO app_user;


--
-- Name: SEQUENCE users_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.users_id_seq TO app_user;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT SELECT,INSERT,DELETE,UPDATE ON TABLES TO app_user;


--
-- PostgreSQL database dump complete
--

