--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: admissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admissions (
    id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    created_by character varying(255),
    modified_by character varying(255),
    updated_at timestamp(6) without time zone NOT NULL,
    applicant_name character varying(255),
    application_date date,
    contact_number character varying(255),
    date_of_birth date,
    documents oid,
    documents_format character varying(255),
    email character varying(255),
    grade_applying integer,
    guardian_contact character varying(255),
    guardian_email character varying(255),
    guardian_name character varying(255),
    previous_grade character varying(255),
    previous_percentage double precision,
    previous_school character varying(255),
    rejection_reason character varying(255),
    status character varying(255),
    address character varying(255),
    CONSTRAINT admissions_status_check CHECK (((status)::text = ANY (ARRAY[('PENDING'::character varying)::text, ('UNDER_REVIEW'::character varying)::text, ('APPROVED'::character varying)::text, ('REJECTED'::character varying)::text, ('WAITLISTED'::character varying)::text, ('CANCELLED'::character varying)::text, ('ENROLLED'::character varying)::text])))
);


ALTER TABLE public.admissions OWNER TO postgres;

--
-- Name: admissions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.admissions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.admissions_id_seq OWNER TO postgres;

--
-- Name: admissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.admissions_id_seq OWNED BY public.admissions.id;


--
-- Name: attendance; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.attendance (
    id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    date date NOT NULL,
    remarks character varying(255),
    status character varying(255) NOT NULL,
    student_id bigint NOT NULL,
    created_by character varying(255),
    modified_by character varying(255),
    check_in_time time(6) without time zone,
    check_out_time time(6) without time zone
);


ALTER TABLE public.attendance OWNER TO postgres;

--
-- Name: attendance_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.attendance_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.attendance_id_seq OWNER TO postgres;

--
-- Name: attendance_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.attendance_id_seq OWNED BY public.attendance.id;


--
-- Name: chapter_distributions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chapter_distributions (
    id bigint NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    chapter_name character varying(255) NOT NULL,
    question_count integer NOT NULL,
    question_type character varying(255),
    total_marks double precision NOT NULL,
    weightage_percentage double precision NOT NULL,
    blueprint_id bigint NOT NULL
);


ALTER TABLE public.chapter_distributions OWNER TO postgres;

--
-- Name: chapter_distributions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.chapter_distributions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.chapter_distributions_id_seq OWNER TO postgres;

--
-- Name: chapter_distributions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.chapter_distributions_id_seq OWNED BY public.chapter_distributions.id;


--
-- Name: chapters; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chapters (
    id bigint NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    academic_year integer NOT NULL,
    description character varying(255),
    grade integer NOT NULL,
    is_active boolean,
    name character varying(255) NOT NULL,
    order_number integer NOT NULL,
    subject character varying(255),
    weightage double precision NOT NULL
);


ALTER TABLE public.chapters OWNER TO postgres;

--
-- Name: chapters_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.chapters_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.chapters_id_seq OWNER TO postgres;

--
-- Name: chapters_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.chapters_id_seq OWNED BY public.chapters.id;


--
-- Name: class_room; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.class_room (
    id bigint NOT NULL,
    building character varying(255),
    capacity integer NOT NULL,
    is_active boolean NOT NULL,
    room_number character varying(255),
    room_type character varying(255)
);


ALTER TABLE public.class_room OWNER TO postgres;

--
-- Name: class_room_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.class_room_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.class_room_id_seq OWNER TO postgres;

--
-- Name: class_room_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.class_room_id_seq OWNED BY public.class_room.id;


--
-- Name: consolidated_staff; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.consolidated_staff (
    id bigint NOT NULL,
    address text,
    bank_name character varying(255),
    basic_salary double precision,
    blood_group character varying(255),
    created_at timestamp without time zone,
    da double precision,
    date_of_birth date,
    email character varying(255) NOT NULL,
    emergency_contact character varying(255),
    employment_status character varying(255),
    first_name character varying(255) NOT NULL,
    gender character varying(255),
    gratuity character varying(255),
    hra double precision,
    ifsc_code character varying(255),
    is_active boolean,
    join_date date NOT NULL,
    last_name character varying(255) NOT NULL,
    net_salary double precision,
    other_allowances double precision,
    pf_contribution double precision,
    pf_uan character varying(255),
    phone_number character varying(255),
    profile_image character varying(255),
    qualifications text,
    role_id bigint NOT NULL,
    salary_account_number character varying(255),
    service_end_date date,
    staff_id character varying(255) NOT NULL,
    ta double precision,
    tax_deduction double precision,
    termination_date date,
    updated_at timestamp without time zone,
    user_id bigint
);


ALTER TABLE public.consolidated_staff OWNER TO postgres;

--
-- Name: consolidated_staff_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.consolidated_staff_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.consolidated_staff_id_seq OWNER TO postgres;

--
-- Name: consolidated_staff_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.consolidated_staff_id_seq OWNED BY public.consolidated_staff.id;


--
-- Name: courses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.courses (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    department character varying(50) NOT NULL,
    teacher_id bigint,
    credits integer DEFAULT 3 NOT NULL,
    capacity integer DEFAULT 30 NOT NULL,
    enrolled integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    teacher_name character varying(255)
);


ALTER TABLE public.courses OWNER TO postgres;

--
-- Name: courses_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.courses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.courses_id_seq OWNER TO postgres;

--
-- Name: courses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.courses_id_seq OWNED BY public.courses.id;


--
-- Name: detailed_exam_results; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.detailed_exam_results (
    id bigint NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    is_locked boolean NOT NULL,
    is_partial_marking boolean NOT NULL,
    is_reviewed boolean NOT NULL,
    locked_at timestamp without time zone,
    locked_by bigint,
    marked_at timestamp without time zone NOT NULL,
    marked_by bigint NOT NULL,
    marks_obtained double precision NOT NULL,
    reviewed_at timestamp without time zone,
    reviewed_by bigint,
    teacher_remarks character varying(1000),
    exam_result_id bigint NOT NULL,
    question_id bigint NOT NULL
);


ALTER TABLE public.detailed_exam_results OWNER TO postgres;

--
-- Name: detailed_exam_results_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.detailed_exam_results_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.detailed_exam_results_id_seq OWNER TO postgres;

--
-- Name: detailed_exam_results_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.detailed_exam_results_id_seq OWNED BY public.detailed_exam_results.id;


--
-- Name: employee_leaves; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employee_leaves (
    id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    approval_date date,
    comments character varying(255),
    end_date date NOT NULL,
    reason character varying(255) NOT NULL,
    start_date date NOT NULL,
    status character varying(255) NOT NULL,
    type character varying(255) NOT NULL,
    approved_by bigint,
    employee_id bigint NOT NULL,
    CONSTRAINT employee_leaves_status_check CHECK (((status)::text = ANY (ARRAY[('PENDING'::character varying)::text, ('APPROVED'::character varying)::text, ('REJECTED'::character varying)::text, ('CANCELLED'::character varying)::text]))),
    CONSTRAINT employee_leaves_type_check CHECK (((type)::text = ANY (ARRAY[('ANNUAL'::character varying)::text, ('SICK'::character varying)::text, ('MATERNITY'::character varying)::text, ('PATERNITY'::character varying)::text, ('UNPAID'::character varying)::text, ('STUDY'::character varying)::text, ('BEREAVEMENT'::character varying)::text, ('EMERGENCY'::character varying)::text])))
);


ALTER TABLE public.employee_leaves OWNER TO postgres;

--
-- Name: employee_leaves_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.employee_leaves_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.employee_leaves_id_seq OWNER TO postgres;

--
-- Name: employee_leaves_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.employee_leaves_id_seq OWNED BY public.employee_leaves.id;


--
-- Name: employees; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.employees (
    id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    department character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    first_name character varying(255) NOT NULL,
    joining_date date NOT NULL,
    last_name character varying(255) NOT NULL,
    phone_number character varying(255) NOT NULL,
    role character varying(255) NOT NULL,
    salary double precision NOT NULL,
    status character varying(255) NOT NULL,
    termination_date date,
    is_active boolean NOT NULL,
    name character varying(255),
    "position" character varying(255),
    CONSTRAINT employees_role_check CHECK (((role)::text = ANY (ARRAY[('TEACHER'::character varying)::text, ('ADMIN'::character varying)::text, ('PRINCIPAL'::character varying)::text, ('LIBRARIAN'::character varying)::text, ('ACCOUNTANT'::character varying)::text, ('COUNSELOR'::character varying)::text, ('SUPPORT_STAFF'::character varying)::text, ('HR_MANAGER'::character varying)::text, ('DEPARTMENT_HEAD'::character varying)::text]))),
    CONSTRAINT employees_status_check CHECK (((status)::text = ANY (ARRAY[('ACTIVE'::character varying)::text, ('ON_LEAVE'::character varying)::text, ('SUSPENDED'::character varying)::text, ('TERMINATED'::character varying)::text, ('RETIRED'::character varying)::text])))
);


ALTER TABLE public.employees OWNER TO postgres;

--
-- Name: employees_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.employees_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.employees_id_seq OWNER TO postgres;

--
-- Name: employees_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.employees_id_seq OWNED BY public.employees.id;


--
-- Name: exam_blueprints; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.exam_blueprints (
    id bigint NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    approval_date timestamp without time zone NOT NULL,
    approved_by bigint NOT NULL,
    comments character varying(255),
    description character varying(255) NOT NULL,
    is_approved boolean NOT NULL,
    name character varying(255) NOT NULL,
    exam_configuration_id bigint NOT NULL,
    paper_structure_id bigint NOT NULL
);


ALTER TABLE public.exam_blueprints OWNER TO postgres;

--
-- Name: exam_blueprints_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.exam_blueprints_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.exam_blueprints_id_seq OWNER TO postgres;

--
-- Name: exam_blueprints_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.exam_blueprints_id_seq OWNED BY public.exam_blueprints.id;


--
-- Name: exam_configurations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.exam_configurations (
    id bigint NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    academic_year integer NOT NULL,
    approval_status character varying(255),
    description character varying(255),
    exam_type character varying(255),
    grade integer NOT NULL,
    is_active boolean,
    name character varying(255) NOT NULL,
    passing_percentage double precision NOT NULL,
    practical_max_marks double precision NOT NULL,
    requires_approval boolean NOT NULL,
    subject character varying(255),
    theory_max_marks double precision NOT NULL,
    exam_id bigint,
    paper_structure_id bigint
);


ALTER TABLE public.exam_configurations OWNER TO postgres;

--
-- Name: exam_configurations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.exam_configurations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.exam_configurations_id_seq OWNER TO postgres;

--
-- Name: exam_configurations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.exam_configurations_id_seq OWNED BY public.exam_configurations.id;


--
-- Name: exam_results; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.exam_results (
    id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    marks_obtained double precision NOT NULL,
    remarks character varying(255),
    status character varying(255),
    exam_id bigint NOT NULL,
    student_id bigint NOT NULL
);


ALTER TABLE public.exam_results OWNER TO postgres;

--
-- Name: exam_results_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.exam_results_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.exam_results_id_seq OWNER TO postgres;

--
-- Name: exam_results_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.exam_results_id_seq OWNED BY public.exam_results.id;


--
-- Name: example_staff; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.example_staff (
    id bigint NOT NULL,
    active boolean NOT NULL,
    address character varying(255),
    date_of_birth date,
    department character varying(255),
    email character varying(255) NOT NULL,
    first_name character varying(255) NOT NULL,
    joining_date date,
    last_name character varying(255) NOT NULL,
    middle_name character varying(255),
    phone character varying(255),
    phone_number character varying(255),
    role character varying(255) NOT NULL,
    staff_id character varying(255),
    teacher_details_id bigint
);


ALTER TABLE public.example_staff OWNER TO postgres;

--
-- Name: example_staff_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.example_staff_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.example_staff_id_seq OWNER TO postgres;

--
-- Name: example_staff_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.example_staff_id_seq OWNED BY public.example_staff.id;


--
-- Name: exams; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.exams (
    id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    description character varying(255),
    exam_date timestamp(6) without time zone NOT NULL,
    exam_type character varying(255),
    grade integer NOT NULL,
    name character varying(255) NOT NULL,
    passing_marks double precision NOT NULL,
    subject character varying(255),
    total_marks double precision NOT NULL
);


ALTER TABLE public.exams OWNER TO postgres;

--
-- Name: exams_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.exams_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.exams_id_seq OWNER TO postgres;

--
-- Name: exams_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.exams_id_seq OWNED BY public.exams.id;


--
-- Name: fee_payment_schedules; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fee_payment_schedules (
    id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    academic_year integer NOT NULL,
    change_reason character varying(255),
    effective_from date NOT NULL,
    effective_until date,
    frequency_change_count integer NOT NULL,
    is_active boolean NOT NULL,
    payment_frequency character varying(255) NOT NULL,
    student_id bigint NOT NULL,
    CONSTRAINT fee_payment_schedules_payment_frequency_check CHECK (((payment_frequency)::text = ANY (ARRAY[('MONTHLY'::character varying)::text, ('QUARTERLY'::character varying)::text])))
);


ALTER TABLE public.fee_payment_schedules OWNER TO postgres;

--
-- Name: fee_payment_schedules_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.fee_payment_schedules_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.fee_payment_schedules_id_seq OWNER TO postgres;

--
-- Name: fee_payment_schedules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.fee_payment_schedules_id_seq OWNED BY public.fee_payment_schedules.id;


--
-- Name: fee_payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fee_payments (
    id bigint NOT NULL,
    amount_paid numeric(38,2) NOT NULL,
    created_at timestamp(6) without time zone,
    payment_date date NOT NULL,
    payment_mode character varying(255) NOT NULL,
    remarks character varying(255),
    transaction_reference character varying(255),
    updated_at timestamp(6) without time zone,
    fee_structure_id bigint NOT NULL,
    payment_schedule_id bigint NOT NULL,
    student_id bigint NOT NULL
);


ALTER TABLE public.fee_payments OWNER TO postgres;

--
-- Name: fee_payments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.fee_payments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.fee_payments_id_seq OWNER TO postgres;

--
-- Name: fee_payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.fee_payments_id_seq OWNED BY public.fee_payments.id;


--
-- Name: fee_structures; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fee_structures (
    id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    created_by character varying(255),
    modified_by character varying(255),
    updated_at timestamp(6) without time zone NOT NULL,
    annual_fees numeric(38,2) NOT NULL,
    building_fees numeric(38,2) NOT NULL,
    class_grade integer NOT NULL,
    lab_fees numeric(38,2) NOT NULL
);


ALTER TABLE public.fee_structures OWNER TO postgres;

--
-- Name: fee_structures_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.fee_structures_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.fee_structures_id_seq OWNER TO postgres;

--
-- Name: fee_structures_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.fee_structures_id_seq OWNED BY public.fee_structures.id;


--
-- Name: fees; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fees (
    id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    amount double precision NOT NULL,
    description character varying(255),
    due_date date NOT NULL,
    fee_type character varying(255) NOT NULL,
    frequency character varying(255) NOT NULL,
    grade integer NOT NULL,
    name character varying(255)
);


ALTER TABLE public.fees OWNER TO postgres;

--
-- Name: fees_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.fees_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.fees_id_seq OWNER TO postgres;

--
-- Name: fees_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.fees_id_seq OWNED BY public.fees.id;


--
-- Name: flyway_schema_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.flyway_schema_history (
    installed_rank integer NOT NULL,
    version character varying(50),
    description character varying(200) NOT NULL,
    type character varying(20) NOT NULL,
    script character varying(1000) NOT NULL,
    checksum integer,
    installed_by character varying(100) NOT NULL,
    installed_on timestamp without time zone DEFAULT now() NOT NULL,
    execution_time integer NOT NULL,
    success boolean NOT NULL
);


ALTER TABLE public.flyway_schema_history OWNER TO postgres;

--
-- Name: hrm_staff; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.hrm_staff (
    id bigint NOT NULL,
    address text,
    bank_name character varying(255),
    basic_salary double precision,
    blood_group character varying(255),
    created_at timestamp without time zone,
    da double precision,
    hrm_date_of_birth date,
    email character varying(255) NOT NULL,
    emergency_contact character varying(255),
    employment_status character varying(255),
    first_name character varying(255) NOT NULL,
    gender character varying(255),
    gratuity character varying(255),
    hra double precision,
    ifsc_code character varying(255),
    is_active boolean,
    join_date date NOT NULL,
    last_name character varying(255) NOT NULL,
    net_salary double precision,
    other_allowances double precision,
    pf_contribution double precision,
    pf_uan character varying(255),
    phone_number character varying(255),
    profile_image character varying(255),
    qualifications text,
    salary_account_number character varying(255),
    service_end_date date,
    staff_id character varying(255) NOT NULL,
    ta double precision,
    tax_deduction double precision,
    termination_date date,
    updated_at timestamp without time zone,
    user_id bigint,
    role_id bigint NOT NULL,
    department character varying(255)
);


ALTER TABLE public.hrm_staff OWNER TO postgres;

--
-- Name: hrm_staff_designation_mappings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.hrm_staff_designation_mappings (
    id bigint NOT NULL,
    assigned_date date,
    created_at timestamp without time zone,
    end_date date,
    is_active boolean,
    is_primary boolean,
    start_date date,
    updated_at timestamp without time zone,
    designation_id bigint NOT NULL,
    staff_id bigint NOT NULL
);


ALTER TABLE public.hrm_staff_designation_mappings OWNER TO postgres;

--
-- Name: hrm_staff_designation_mappings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.hrm_staff_designation_mappings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.hrm_staff_designation_mappings_id_seq OWNER TO postgres;

--
-- Name: hrm_staff_designation_mappings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.hrm_staff_designation_mappings_id_seq OWNED BY public.hrm_staff_designation_mappings.id;


--
-- Name: hrm_staff_designations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.hrm_staff_designations (
    id bigint NOT NULL,
    description character varying(255),
    is_active boolean,
    name character varying(255)
);


ALTER TABLE public.hrm_staff_designations OWNER TO postgres;

--
-- Name: hrm_staff_designations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.hrm_staff_designations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.hrm_staff_designations_id_seq OWNER TO postgres;

--
-- Name: hrm_staff_designations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.hrm_staff_designations_id_seq OWNED BY public.hrm_staff_designations.id;


--
-- Name: hrm_staff_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.hrm_staff_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.hrm_staff_id_seq OWNER TO postgres;

--
-- Name: hrm_staff_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.hrm_staff_id_seq OWNED BY public.hrm_staff.id;


--
-- Name: hrm_staff_roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.hrm_staff_roles (
    id bigint NOT NULL,
    description character varying(255),
    is_active boolean,
    role_name character varying(255)
);


ALTER TABLE public.hrm_staff_roles OWNER TO postgres;

--
-- Name: hrm_staff_roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.hrm_staff_roles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.hrm_staff_roles_id_seq OWNER TO postgres;

--
-- Name: hrm_staff_roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.hrm_staff_roles_id_seq OWNED BY public.hrm_staff_roles.id;


--
-- Name: in_app_notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.in_app_notifications (
    id bigint NOT NULL,
    content text,
    created_at timestamp(6) without time zone,
    read_at timestamp(6) without time zone,
    recipient character varying(255) NOT NULL,
    status character varying(255),
    subject character varying(255) NOT NULL,
    CONSTRAINT in_app_notifications_status_check CHECK (((status)::text = ANY (ARRAY[('UNREAD'::character varying)::text, ('READ'::character varying)::text, ('ARCHIVED'::character varying)::text, ('DELETED'::character varying)::text])))
);


ALTER TABLE public.in_app_notifications OWNER TO postgres;

--
-- Name: in_app_notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.in_app_notifications_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.in_app_notifications_id_seq OWNER TO postgres;

--
-- Name: in_app_notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.in_app_notifications_id_seq OWNED BY public.in_app_notifications.id;


--
-- Name: late_fees; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.late_fees (
    id bigint NOT NULL,
    created_at timestamp(6) without time zone,
    fine_amount numeric(38,2) NOT NULL,
    fine_description character varying(255),
    late_fee_amount numeric(38,2) NOT NULL,
    late_fee_description character varying(255),
    month integer NOT NULL,
    updated_at timestamp(6) without time zone,
    fee_structure_id bigint NOT NULL
);


ALTER TABLE public.late_fees OWNER TO postgres;

--
-- Name: late_fees_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.late_fees_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.late_fees_id_seq OWNER TO postgres;

--
-- Name: late_fees_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.late_fees_id_seq OWNED BY public.late_fees.id;


--
-- Name: message_read_status; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.message_read_status (
    message_id bigint NOT NULL,
    read_by character varying(255)
);


ALTER TABLE public.message_read_status OWNER TO postgres;

--
-- Name: message_recipients; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.message_recipients (
    message_id bigint NOT NULL,
    recipients character varying(255)
);


ALTER TABLE public.message_recipients OWNER TO postgres;

--
-- Name: messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.messages (
    id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    content text NOT NULL,
    message_type character varying(255) NOT NULL,
    priority character varying(255) NOT NULL,
    send_time timestamp(6) without time zone NOT NULL,
    subject character varying(255) NOT NULL,
    sender_id bigint NOT NULL,
    CONSTRAINT messages_message_type_check CHECK (((message_type)::text = ANY (ARRAY[('ANNOUNCEMENT'::character varying)::text, ('STAFF_NOTICE'::character varying)::text, ('EMERGENCY_ALERT'::character varying)::text, ('GENERAL_MESSAGE'::character varying)::text, ('EVENT_NOTIFICATION'::character varying)::text, ('ACADEMIC_UPDATE'::character varying)::text]))),
    CONSTRAINT messages_priority_check CHECK (((priority)::text = ANY (ARRAY[('LOW'::character varying)::text, ('MEDIUM'::character varying)::text, ('HIGH'::character varying)::text, ('URGENT'::character varying)::text])))
);


ALTER TABLE public.messages OWNER TO postgres;

--
-- Name: messages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.messages_id_seq
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
-- Name: payment_schedules; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payment_schedules (
    id bigint NOT NULL,
    amount numeric(38,2) NOT NULL,
    created_at timestamp(6) without time zone,
    is_enabled boolean NOT NULL,
    schedule_type character varying(255) NOT NULL,
    updated_at timestamp(6) without time zone,
    fee_structure_id bigint NOT NULL,
    CONSTRAINT payment_schedules_schedule_type_check CHECK (((schedule_type)::text = ANY (ARRAY[('MONTHLY'::character varying)::text, ('QUARTERLY'::character varying)::text, ('YEARLY'::character varying)::text])))
);


ALTER TABLE public.payment_schedules OWNER TO postgres;

--
-- Name: payment_schedules_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.payment_schedules_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.payment_schedules_id_seq OWNER TO postgres;

--
-- Name: payment_schedules_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.payment_schedules_id_seq OWNED BY public.payment_schedules.id;


--
-- Name: payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payments (
    id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    amount double precision NOT NULL,
    payment_date timestamp(6) without time zone NOT NULL,
    payment_method character varying(255) NOT NULL,
    remarks character varying(255),
    status character varying(255) NOT NULL,
    transaction_reference character varying(255),
    fee_id bigint NOT NULL,
    student_id bigint NOT NULL,
    payer_contact_info character varying(255),
    payer_name character varying(255),
    payer_relation_to_student character varying(255),
    receipt_number character varying(255)
);


ALTER TABLE public.payments OWNER TO postgres;

--
-- Name: payments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.payments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.payments_id_seq OWNER TO postgres;

--
-- Name: payments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.payments_id_seq OWNED BY public.payments.id;


--
-- Name: question_paper_structures; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.question_paper_structures (
    id bigint NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    mandatory_questions integer NOT NULL,
    name character varying(255) NOT NULL,
    optional_questions integer NOT NULL,
    total_marks double precision NOT NULL,
    total_questions integer NOT NULL,
    exam_configuration_id bigint
);


ALTER TABLE public.question_paper_structures OWNER TO postgres;

--
-- Name: question_paper_structures_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.question_paper_structures_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.question_paper_structures_id_seq OWNER TO postgres;

--
-- Name: question_paper_structures_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.question_paper_structures_id_seq OWNED BY public.question_paper_structures.id;


--
-- Name: question_papers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.question_papers (
    id bigint NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    approval_date timestamp without time zone,
    approval_status character varying(255),
    approved_by bigint,
    comments character varying(255),
    created_by bigint NOT NULL,
    time_allotted integer NOT NULL,
    title character varying(255) NOT NULL,
    blueprint_id bigint,
    exam_id bigint NOT NULL
);


ALTER TABLE public.question_papers OWNER TO postgres;

--
-- Name: question_papers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.question_papers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.question_papers_id_seq OWNER TO postgres;

--
-- Name: question_papers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.question_papers_id_seq OWNED BY public.question_papers.id;


--
-- Name: question_sections; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.question_sections (
    id bigint NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    is_mandatory boolean NOT NULL,
    marks_per_question double precision NOT NULL,
    question_count integer NOT NULL,
    question_type character varying(255),
    section_name character varying(255) NOT NULL,
    question_paper_structure_id bigint
);


ALTER TABLE public.question_sections OWNER TO postgres;

--
-- Name: question_sections_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.question_sections_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.question_sections_id_seq OWNER TO postgres;

--
-- Name: question_sections_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.question_sections_id_seq OWNED BY public.question_sections.id;


--
-- Name: question_wise_marks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.question_wise_marks (
    id bigint NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    absence_reason text,
    edit_reason text,
    edited_at timestamp without time zone,
    edited_by bigint,
    evaluator_comments character varying(255),
    is_absent boolean NOT NULL,
    is_locked boolean NOT NULL,
    locked_at timestamp without time zone,
    locked_by bigint,
    obtained_marks double precision NOT NULL,
    was_edited boolean,
    exam_id bigint NOT NULL,
    question_id bigint NOT NULL,
    student_id bigint NOT NULL
);


ALTER TABLE public.question_wise_marks OWNER TO postgres;

--
-- Name: question_wise_marks_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.question_wise_marks_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.question_wise_marks_id_seq OWNER TO postgres;

--
-- Name: question_wise_marks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.question_wise_marks_id_seq OWNED BY public.question_wise_marks.id;


--
-- Name: questions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.questions (
    id bigint NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL,
    answer_key character varying(2000),
    chapter_name character varying(255) NOT NULL,
    is_compulsory boolean,
    marking_scheme character varying(1000),
    marks double precision NOT NULL,
    question_number integer NOT NULL,
    question_text character varying(1000) NOT NULL,
    question_type character varying(255),
    section_number integer NOT NULL,
    question_paper_id bigint
);


ALTER TABLE public.questions OWNER TO postgres;

--
-- Name: questions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.questions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.questions_id_seq OWNER TO postgres;

--
-- Name: questions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.questions_id_seq OWNED BY public.questions.id;


--
-- Name: school_holidays; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.school_holidays (
    id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    date date NOT NULL,
    description character varying(255),
    name character varying(255) NOT NULL,
    type character varying(255) NOT NULL,
    CONSTRAINT school_holidays_type_check CHECK (((type)::text = ANY (ARRAY[('NATIONAL_HOLIDAY'::character varying)::text, ('RELIGIOUS_HOLIDAY'::character varying)::text, ('SCHOOL_FUNCTION'::character varying)::text, ('OTHER'::character varying)::text])))
);


ALTER TABLE public.school_holidays OWNER TO postgres;

--
-- Name: school_holidays_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.school_holidays_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.school_holidays_id_seq OWNER TO postgres;

--
-- Name: school_holidays_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.school_holidays_id_seq OWNED BY public.school_holidays.id;


--
-- Name: school_staff; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.school_staff (
    id bigint NOT NULL,
    active boolean NOT NULL,
    address text,
    basic_salary double precision,
    blood_group character varying(255),
    da double precision,
    date_of_birth date,
    department character varying(255),
    email character varying(255) NOT NULL,
    emergency_contact character varying(255),
    employment_status character varying(255),
    first_name character varying(255) NOT NULL,
    gender character varying(255),
    gratuity character varying(255),
    hra double precision,
    is_active boolean NOT NULL,
    join_date date,
    joining_date date,
    last_name character varying(255) NOT NULL,
    middle_name character varying(255),
    pf_uan character varying(255),
    phone character varying(255),
    phone_number character varying(255),
    profile_image character varying(255),
    qualifications text,
    role character varying(255),
    service_end_date date,
    staff_id character varying(255) NOT NULL,
    termination_date date,
    user_id bigint,
    role_id bigint,
    teacher_details_id bigint,
    date_of_joining date,
    designation character varying(255)
);


ALTER TABLE public.school_staff OWNER TO postgres;

--
-- Name: school_staff_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.school_staff_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.school_staff_id_seq OWNER TO postgres;

--
-- Name: school_staff_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.school_staff_id_seq OWNED BY public.school_staff.id;


--
-- Name: staff; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.staff (
    id bigint NOT NULL,
    address text,
    blood_group character varying(255),
    created_at timestamp(6) without time zone,
    date_of_birth date,
    email character varying(255) NOT NULL,
    emergency_contact character varying(255),
    first_name character varying(255) NOT NULL,
    gender character varying(255),
    is_active boolean,
    join_date date NOT NULL,
    last_name character varying(255) NOT NULL,
    phone_number character varying(255),
    profile_image character varying(255),
    qualifications text,
    staff_id character varying(255) NOT NULL,
    updated_at timestamp(6) without time zone,
    user_id bigint,
    role_id bigint NOT NULL,
    employment_status character varying(255),
    termination_date date,
    pf_uan character varying(50),
    gratuity character varying(50),
    service_end_date date,
    basic_salary double precision,
    hra double precision,
    da double precision,
    ta double precision,
    other_allowances double precision,
    pf_contribution double precision,
    tax_deduction double precision,
    net_salary double precision,
    salary_account_number character varying(50),
    bank_name character varying(100),
    ifsc_code character varying(20),
    active boolean NOT NULL,
    staff_date_of_birth date,
    department character varying(255),
    joining_date date,
    middle_name character varying(255),
    phone character varying(255),
    role character varying(255) NOT NULL,
    teacher_details_id bigint,
    designation character varying(255),
    CONSTRAINT staff_employment_status_check CHECK (((employment_status)::text = ANY (ARRAY[('ACTIVE'::character varying)::text, ('ON_LEAVE'::character varying)::text, ('SUSPENDED'::character varying)::text, ('TERMINATED'::character varying)::text, ('RETIRED'::character varying)::text, ('RESIGNED'::character varying)::text])))
);


ALTER TABLE public.staff OWNER TO postgres;

--
-- Name: staff_designation_mappings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.staff_designation_mappings (
    id bigint NOT NULL,
    assigned_date date NOT NULL,
    created_at timestamp(6) without time zone,
    is_active boolean,
    updated_at timestamp(6) without time zone,
    designation_id bigint NOT NULL,
    staff_id bigint NOT NULL
);


ALTER TABLE public.staff_designation_mappings OWNER TO postgres;

--
-- Name: staff_designation_mappings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.staff_designation_mappings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.staff_designation_mappings_id_seq OWNER TO postgres;

--
-- Name: staff_designation_mappings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.staff_designation_mappings_id_seq OWNED BY public.staff_designation_mappings.id;


--
-- Name: staff_designations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.staff_designations (
    id bigint NOT NULL,
    created_at timestamp(6) without time zone,
    description text,
    name character varying(255) NOT NULL,
    updated_at timestamp(6) without time zone
);


ALTER TABLE public.staff_designations OWNER TO postgres;

--
-- Name: staff_designations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.staff_designations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.staff_designations_id_seq OWNER TO postgres;

--
-- Name: staff_designations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.staff_designations_id_seq OWNED BY public.staff_designations.id;


--
-- Name: staff_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.staff_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.staff_id_seq OWNER TO postgres;

--
-- Name: staff_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.staff_id_seq OWNED BY public.staff.id;


--
-- Name: staff_roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.staff_roles (
    id bigint NOT NULL,
    created_at timestamp(6) without time zone,
    description character varying(255),
    role_name character varying(255) NOT NULL,
    updated_at timestamp(6) without time zone,
    name character varying(255),
    is_active boolean
);


ALTER TABLE public.staff_roles OWNER TO postgres;

--
-- Name: staff_roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.staff_roles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.staff_roles_id_seq OWNER TO postgres;

--
-- Name: staff_roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.staff_roles_id_seq OWNED BY public.staff_roles.id;


--
-- Name: student_fee_assignments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.student_fee_assignments (
    id bigint NOT NULL,
    created_at timestamp(6) without time zone,
    effective_from date NOT NULL,
    effective_to date,
    is_active boolean NOT NULL,
    updated_at timestamp(6) without time zone,
    fee_structure_id bigint NOT NULL,
    payment_schedule_id bigint NOT NULL,
    student_id bigint NOT NULL,
    transport_route_id bigint
);


ALTER TABLE public.student_fee_assignments OWNER TO postgres;

--
-- Name: student_fee_assignments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.student_fee_assignments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.student_fee_assignments_id_seq OWNER TO postgres;

--
-- Name: student_fee_assignments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.student_fee_assignments_id_seq OWNED BY public.student_fee_assignments.id;


--
-- Name: students; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.students (
    id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    address character varying(255),
    date_of_birth date NOT NULL,
    email character varying(255),
    first_name character varying(255) NOT NULL,
    gender character varying(255) NOT NULL,
    grade integer NOT NULL,
    guardian_email character varying(255),
    guardian_name character varying(255),
    guardian_phone character varying(255),
    last_name character varying(255) NOT NULL,
    phone_number character varying(255),
    status character varying(255),
    student_id character varying(255),
    created_by character varying(255),
    modified_by character varying(255),
    admission_date date,
    blood_group character varying(255),
    contact_number character varying(255),
    guardian_contact character varying(255),
    medical_conditions character varying(255),
    photo_url character varying(255),
    section character varying(255),
    admission_id bigint,
    aadhar_number character varying(255),
    bus_route_number character varying(255),
    guardian_annual_income numeric(38,2),
    guardian_occupation character varying(255),
    guardian_office_address character varying(255),
    house_alloted character varying(255),
    previous_school character varying(255),
    subjects text,
    tc_date date,
    tc_number character varying(255),
    tc_reason character varying(255),
    transport_mode character varying(255),
    udise_number character varying(255),
    whatsapp_number character varying(255),
    roll_number character varying(255)
);


ALTER TABLE public.students OWNER TO postgres;

--
-- Name: students_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.students_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.students_id_seq OWNER TO postgres;

--
-- Name: students_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.students_id_seq OWNED BY public.students.id;


--
-- Name: teacher_attendance; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.teacher_attendance (
    id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    attendance_date date NOT NULL,
    attendance_status character varying(255) NOT NULL,
    last_modified_by character varying(255),
    marked_by character varying(255),
    reason character varying(255),
    remarks character varying(255),
    employee_id bigint NOT NULL,
    CONSTRAINT teacher_attendance_attendance_status_check CHECK (((attendance_status)::text = ANY (ARRAY[('PRESENT'::character varying)::text, ('ABSENT'::character varying)::text, ('HALF_DAY'::character varying)::text, ('ON_LEAVE'::character varying)::text, ('HOLIDAY'::character varying)::text])))
);


ALTER TABLE public.teacher_attendance OWNER TO postgres;

--
-- Name: teacher_attendance_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.teacher_attendance_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.teacher_attendance_id_seq OWNER TO postgres;

--
-- Name: teacher_attendance_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.teacher_attendance_id_seq OWNED BY public.teacher_attendance.id;


--
-- Name: teacher_details; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.teacher_details (
    id bigint NOT NULL,
    created_at timestamp(6) without time zone,
    department character varying(255),
    qualification character varying(255),
    specialization character varying(255),
    subjects character varying(255),
    updated_at timestamp(6) without time zone,
    years_of_experience integer,
    certifications character varying(255),
    educational_background character varying(255),
    professional_development character varying(255),
    subjects_taught character varying(255)
);


ALTER TABLE public.teacher_details OWNER TO postgres;

--
-- Name: teacher_details_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.teacher_details_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.teacher_details_id_seq OWNER TO postgres;

--
-- Name: teacher_details_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.teacher_details_id_seq OWNED BY public.teacher_details.id;


--
-- Name: teachers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.teachers (
    id bigint NOT NULL,
    class_assigned_id bigint,
    created_at timestamp(6) without time zone,
    department character varying(255),
    is_class_teacher boolean,
    specialization character varying(255),
    subjects text,
    teaching_experience integer,
    updated_at timestamp(6) without time zone,
    staff_id bigint NOT NULL
);


ALTER TABLE public.teachers OWNER TO postgres;

--
-- Name: teachers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.teachers_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.teachers_id_seq OWNER TO postgres;

--
-- Name: teachers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.teachers_id_seq OWNED BY public.teachers.id;


--
-- Name: time_slots; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.time_slots (
    id bigint NOT NULL,
    day_of_week character varying(255) NOT NULL,
    end_time time(6) without time zone NOT NULL,
    is_break boolean NOT NULL,
    slot_name character varying(255),
    start_time time(6) without time zone NOT NULL,
    CONSTRAINT time_slots_day_of_week_check CHECK (((day_of_week)::text = ANY (ARRAY[('MONDAY'::character varying)::text, ('TUESDAY'::character varying)::text, ('WEDNESDAY'::character varying)::text, ('THURSDAY'::character varying)::text, ('FRIDAY'::character varying)::text, ('SATURDAY'::character varying)::text, ('SUNDAY'::character varying)::text])))
);


ALTER TABLE public.time_slots OWNER TO postgres;

--
-- Name: time_slots_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.time_slots_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.time_slots_id_seq OWNER TO postgres;

--
-- Name: time_slots_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.time_slots_id_seq OWNED BY public.time_slots.id;


--
-- Name: timetable; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.timetable (
    id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    academic_year character varying(255),
    class_name character varying(255),
    is_active boolean NOT NULL,
    section character varying(255),
    valid_from date,
    valid_to date
);


ALTER TABLE public.timetable OWNER TO postgres;

--
-- Name: timetable_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.timetable_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.timetable_id_seq OWNER TO postgres;

--
-- Name: timetable_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.timetable_id_seq OWNED BY public.timetable.id;


--
-- Name: transport_routes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transport_routes (
    id bigint NOT NULL,
    created_at timestamp(6) without time zone,
    fee_amount numeric(38,2) NOT NULL,
    route_description character varying(255),
    route_name character varying(255) NOT NULL,
    updated_at timestamp(6) without time zone
);


ALTER TABLE public.transport_routes OWNER TO postgres;

--
-- Name: transport_routes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.transport_routes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.transport_routes_id_seq OWNER TO postgres;

--
-- Name: transport_routes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.transport_routes_id_seq OWNED BY public.transport_routes.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    created_by character varying(255),
    modified_by character varying(255),
    updated_at timestamp(6) without time zone NOT NULL,
    account_non_expired boolean NOT NULL,
    account_non_locked boolean NOT NULL,
    credentials_non_expired boolean NOT NULL,
    email character varying(255),
    enabled boolean NOT NULL,
    password character varying(255),
    role character varying(255),
    username character varying(255),
    full_name character varying(255),
    CONSTRAINT users_role_check CHECK (((role)::text = ANY (ARRAY[('ADMIN'::character varying)::text, ('TEACHER'::character varying)::text, ('STUDENT'::character varying)::text, ('STAFF'::character varying)::text, ('PARENT'::character varying)::text, ('SYSTEM'::character varying)::text])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
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
-- Name: admissions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admissions ALTER COLUMN id SET DEFAULT nextval('public.admissions_id_seq'::regclass);


--
-- Name: attendance id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance ALTER COLUMN id SET DEFAULT nextval('public.attendance_id_seq'::regclass);


--
-- Name: chapter_distributions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chapter_distributions ALTER COLUMN id SET DEFAULT nextval('public.chapter_distributions_id_seq'::regclass);


--
-- Name: chapters id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chapters ALTER COLUMN id SET DEFAULT nextval('public.chapters_id_seq'::regclass);


--
-- Name: class_room id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.class_room ALTER COLUMN id SET DEFAULT nextval('public.class_room_id_seq'::regclass);


--
-- Name: consolidated_staff id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consolidated_staff ALTER COLUMN id SET DEFAULT nextval('public.consolidated_staff_id_seq'::regclass);


--
-- Name: courses id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courses ALTER COLUMN id SET DEFAULT nextval('public.courses_id_seq'::regclass);


--
-- Name: detailed_exam_results id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detailed_exam_results ALTER COLUMN id SET DEFAULT nextval('public.detailed_exam_results_id_seq'::regclass);


--
-- Name: employee_leaves id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_leaves ALTER COLUMN id SET DEFAULT nextval('public.employee_leaves_id_seq'::regclass);


--
-- Name: employees id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees ALTER COLUMN id SET DEFAULT nextval('public.employees_id_seq'::regclass);


--
-- Name: exam_blueprints id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exam_blueprints ALTER COLUMN id SET DEFAULT nextval('public.exam_blueprints_id_seq'::regclass);


--
-- Name: exam_configurations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exam_configurations ALTER COLUMN id SET DEFAULT nextval('public.exam_configurations_id_seq'::regclass);


--
-- Name: exam_results id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exam_results ALTER COLUMN id SET DEFAULT nextval('public.exam_results_id_seq'::regclass);


--
-- Name: example_staff id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.example_staff ALTER COLUMN id SET DEFAULT nextval('public.example_staff_id_seq'::regclass);


--
-- Name: exams id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exams ALTER COLUMN id SET DEFAULT nextval('public.exams_id_seq'::regclass);


--
-- Name: fee_payment_schedules id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fee_payment_schedules ALTER COLUMN id SET DEFAULT nextval('public.fee_payment_schedules_id_seq'::regclass);


--
-- Name: fee_payments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fee_payments ALTER COLUMN id SET DEFAULT nextval('public.fee_payments_id_seq'::regclass);


--
-- Name: fee_structures id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fee_structures ALTER COLUMN id SET DEFAULT nextval('public.fee_structures_id_seq'::regclass);


--
-- Name: fees id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fees ALTER COLUMN id SET DEFAULT nextval('public.fees_id_seq'::regclass);


--
-- Name: hrm_staff id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hrm_staff ALTER COLUMN id SET DEFAULT nextval('public.hrm_staff_id_seq'::regclass);


--
-- Name: hrm_staff_designation_mappings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hrm_staff_designation_mappings ALTER COLUMN id SET DEFAULT nextval('public.hrm_staff_designation_mappings_id_seq'::regclass);


--
-- Name: hrm_staff_designations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hrm_staff_designations ALTER COLUMN id SET DEFAULT nextval('public.hrm_staff_designations_id_seq'::regclass);


--
-- Name: hrm_staff_roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hrm_staff_roles ALTER COLUMN id SET DEFAULT nextval('public.hrm_staff_roles_id_seq'::regclass);


--
-- Name: in_app_notifications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.in_app_notifications ALTER COLUMN id SET DEFAULT nextval('public.in_app_notifications_id_seq'::regclass);


--
-- Name: late_fees id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.late_fees ALTER COLUMN id SET DEFAULT nextval('public.late_fees_id_seq'::regclass);


--
-- Name: messages id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages ALTER COLUMN id SET DEFAULT nextval('public.messages_id_seq'::regclass);


--
-- Name: payment_schedules id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_schedules ALTER COLUMN id SET DEFAULT nextval('public.payment_schedules_id_seq'::regclass);


--
-- Name: payments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments ALTER COLUMN id SET DEFAULT nextval('public.payments_id_seq'::regclass);


--
-- Name: question_paper_structures id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.question_paper_structures ALTER COLUMN id SET DEFAULT nextval('public.question_paper_structures_id_seq'::regclass);


--
-- Name: question_papers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.question_papers ALTER COLUMN id SET DEFAULT nextval('public.question_papers_id_seq'::regclass);


--
-- Name: question_sections id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.question_sections ALTER COLUMN id SET DEFAULT nextval('public.question_sections_id_seq'::regclass);


--
-- Name: question_wise_marks id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.question_wise_marks ALTER COLUMN id SET DEFAULT nextval('public.question_wise_marks_id_seq'::regclass);


--
-- Name: questions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.questions ALTER COLUMN id SET DEFAULT nextval('public.questions_id_seq'::regclass);


--
-- Name: school_holidays id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.school_holidays ALTER COLUMN id SET DEFAULT nextval('public.school_holidays_id_seq'::regclass);


--
-- Name: school_staff id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.school_staff ALTER COLUMN id SET DEFAULT nextval('public.school_staff_id_seq'::regclass);


--
-- Name: staff id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff ALTER COLUMN id SET DEFAULT nextval('public.staff_id_seq'::regclass);


--
-- Name: staff_designation_mappings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_designation_mappings ALTER COLUMN id SET DEFAULT nextval('public.staff_designation_mappings_id_seq'::regclass);


--
-- Name: staff_designations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_designations ALTER COLUMN id SET DEFAULT nextval('public.staff_designations_id_seq'::regclass);


--
-- Name: staff_roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_roles ALTER COLUMN id SET DEFAULT nextval('public.staff_roles_id_seq'::regclass);


--
-- Name: student_fee_assignments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_fee_assignments ALTER COLUMN id SET DEFAULT nextval('public.student_fee_assignments_id_seq'::regclass);


--
-- Name: students id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students ALTER COLUMN id SET DEFAULT nextval('public.students_id_seq'::regclass);


--
-- Name: teacher_attendance id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teacher_attendance ALTER COLUMN id SET DEFAULT nextval('public.teacher_attendance_id_seq'::regclass);


--
-- Name: teacher_details id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teacher_details ALTER COLUMN id SET DEFAULT nextval('public.teacher_details_id_seq'::regclass);


--
-- Name: teachers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teachers ALTER COLUMN id SET DEFAULT nextval('public.teachers_id_seq'::regclass);


--
-- Name: time_slots id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.time_slots ALTER COLUMN id SET DEFAULT nextval('public.time_slots_id_seq'::regclass);


--
-- Name: timetable id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.timetable ALTER COLUMN id SET DEFAULT nextval('public.timetable_id_seq'::regclass);


--
-- Name: transport_routes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transport_routes ALTER COLUMN id SET DEFAULT nextval('public.transport_routes_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: admissions admissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admissions
    ADD CONSTRAINT admissions_pkey PRIMARY KEY (id);


--
-- Name: attendance attendance_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT attendance_pkey PRIMARY KEY (id);


--
-- Name: chapter_distributions chapter_distributions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chapter_distributions
    ADD CONSTRAINT chapter_distributions_pkey PRIMARY KEY (id);


--
-- Name: chapters chapters_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chapters
    ADD CONSTRAINT chapters_pkey PRIMARY KEY (id);


--
-- Name: class_room class_room_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.class_room
    ADD CONSTRAINT class_room_pkey PRIMARY KEY (id);


--
-- Name: consolidated_staff consolidated_staff_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consolidated_staff
    ADD CONSTRAINT consolidated_staff_pkey PRIMARY KEY (id);


--
-- Name: courses courses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.courses
    ADD CONSTRAINT courses_pkey PRIMARY KEY (id);


--
-- Name: detailed_exam_results detailed_exam_results_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detailed_exam_results
    ADD CONSTRAINT detailed_exam_results_pkey PRIMARY KEY (id);


--
-- Name: employee_leaves employee_leaves_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_leaves
    ADD CONSTRAINT employee_leaves_pkey PRIMARY KEY (id);


--
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (id);


--
-- Name: exam_blueprints exam_blueprints_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exam_blueprints
    ADD CONSTRAINT exam_blueprints_pkey PRIMARY KEY (id);


--
-- Name: exam_configurations exam_configurations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exam_configurations
    ADD CONSTRAINT exam_configurations_pkey PRIMARY KEY (id);


--
-- Name: exam_results exam_results_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exam_results
    ADD CONSTRAINT exam_results_pkey PRIMARY KEY (id);


--
-- Name: example_staff example_staff_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.example_staff
    ADD CONSTRAINT example_staff_pkey PRIMARY KEY (id);


--
-- Name: exams exams_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exams
    ADD CONSTRAINT exams_pkey PRIMARY KEY (id);


--
-- Name: fee_payment_schedules fee_payment_schedules_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fee_payment_schedules
    ADD CONSTRAINT fee_payment_schedules_pkey PRIMARY KEY (id);


--
-- Name: fee_payments fee_payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fee_payments
    ADD CONSTRAINT fee_payments_pkey PRIMARY KEY (id);


--
-- Name: fee_structures fee_structures_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fee_structures
    ADD CONSTRAINT fee_structures_pkey PRIMARY KEY (id);


--
-- Name: fees fees_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fees
    ADD CONSTRAINT fees_pkey PRIMARY KEY (id);


--
-- Name: flyway_schema_history flyway_schema_history_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.flyway_schema_history
    ADD CONSTRAINT flyway_schema_history_pk PRIMARY KEY (installed_rank);


--
-- Name: hrm_staff_designation_mappings hrm_staff_designation_mappings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hrm_staff_designation_mappings
    ADD CONSTRAINT hrm_staff_designation_mappings_pkey PRIMARY KEY (id);


--
-- Name: hrm_staff_designations hrm_staff_designations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hrm_staff_designations
    ADD CONSTRAINT hrm_staff_designations_pkey PRIMARY KEY (id);


--
-- Name: hrm_staff hrm_staff_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hrm_staff
    ADD CONSTRAINT hrm_staff_pkey PRIMARY KEY (id);


--
-- Name: hrm_staff_roles hrm_staff_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hrm_staff_roles
    ADD CONSTRAINT hrm_staff_roles_pkey PRIMARY KEY (id);


--
-- Name: in_app_notifications in_app_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.in_app_notifications
    ADD CONSTRAINT in_app_notifications_pkey PRIMARY KEY (id);


--
-- Name: late_fees late_fees_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.late_fees
    ADD CONSTRAINT late_fees_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: payment_schedules payment_schedules_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_schedules
    ADD CONSTRAINT payment_schedules_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: question_paper_structures question_paper_structures_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.question_paper_structures
    ADD CONSTRAINT question_paper_structures_pkey PRIMARY KEY (id);


--
-- Name: question_papers question_papers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.question_papers
    ADD CONSTRAINT question_papers_pkey PRIMARY KEY (id);


--
-- Name: question_sections question_sections_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.question_sections
    ADD CONSTRAINT question_sections_pkey PRIMARY KEY (id);


--
-- Name: question_wise_marks question_wise_marks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.question_wise_marks
    ADD CONSTRAINT question_wise_marks_pkey PRIMARY KEY (id);


--
-- Name: questions questions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT questions_pkey PRIMARY KEY (id);


--
-- Name: school_holidays school_holidays_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.school_holidays
    ADD CONSTRAINT school_holidays_pkey PRIMARY KEY (id);


--
-- Name: school_staff school_staff_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.school_staff
    ADD CONSTRAINT school_staff_pkey PRIMARY KEY (id);


--
-- Name: staff_designation_mappings staff_designation_mappings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_designation_mappings
    ADD CONSTRAINT staff_designation_mappings_pkey PRIMARY KEY (id);


--
-- Name: staff_designations staff_designations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_designations
    ADD CONSTRAINT staff_designations_pkey PRIMARY KEY (id);


--
-- Name: staff staff_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_pkey PRIMARY KEY (id);


--
-- Name: staff_roles staff_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_roles
    ADD CONSTRAINT staff_roles_pkey PRIMARY KEY (id);


--
-- Name: student_fee_assignments student_fee_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_fee_assignments
    ADD CONSTRAINT student_fee_assignments_pkey PRIMARY KEY (id);


--
-- Name: students students_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT students_pkey PRIMARY KEY (id);


--
-- Name: teacher_attendance teacher_attendance_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teacher_attendance
    ADD CONSTRAINT teacher_attendance_pkey PRIMARY KEY (id);


--
-- Name: teacher_details teacher_details_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teacher_details
    ADD CONSTRAINT teacher_details_pkey PRIMARY KEY (id);


--
-- Name: teachers teachers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teachers
    ADD CONSTRAINT teachers_pkey PRIMARY KEY (id);


--
-- Name: time_slots time_slots_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.time_slots
    ADD CONSTRAINT time_slots_pkey PRIMARY KEY (id);


--
-- Name: timetable timetable_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.timetable
    ADD CONSTRAINT timetable_pkey PRIMARY KEY (id);


--
-- Name: transport_routes transport_routes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transport_routes
    ADD CONSTRAINT transport_routes_pkey PRIMARY KEY (id);


--
-- Name: teacher_attendance uk44t7oovq7wqo3edm8el46epvr; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teacher_attendance
    ADD CONSTRAINT uk44t7oovq7wqo3edm8el46epvr UNIQUE (employee_id, attendance_date);


--
-- Name: staff_designation_mappings uk4l2y19tagll1kyvoo0qpm35ir; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_designation_mappings
    ADD CONSTRAINT uk4l2y19tagll1kyvoo0qpm35ir UNIQUE (staff_id, designation_id);


--
-- Name: students uk_5mbus2m1tm2acucrp6t627jmx; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT uk_5mbus2m1tm2acucrp6t627jmx UNIQUE (student_id);


--
-- Name: users uk_6dotkott2kjsp8vw4d0m25fb7; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT uk_6dotkott2kjsp8vw4d0m25fb7 UNIQUE (email);


--
-- Name: consolidated_staff uk_6venvwwru3po7a6qajm5gwd6n; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consolidated_staff
    ADD CONSTRAINT uk_6venvwwru3po7a6qajm5gwd6n UNIQUE (email);


--
-- Name: example_staff uk_8pgw37s69jcvrnx5moktx2549; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.example_staff
    ADD CONSTRAINT uk_8pgw37s69jcvrnx5moktx2549 UNIQUE (email);


--
-- Name: fee_structures uk_aah48ovq4we0avcmdfofdxa8; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fee_structures
    ADD CONSTRAINT uk_aah48ovq4we0avcmdfofdxa8 UNIQUE (class_grade);


--
-- Name: consolidated_staff uk_ab570ji5al85n0ck9lcbn4dei; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.consolidated_staff
    ADD CONSTRAINT uk_ab570ji5al85n0ck9lcbn4dei UNIQUE (staff_id);


--
-- Name: school_staff uk_bty2oqrkagehhleybiylsgsc3; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.school_staff
    ADD CONSTRAINT uk_bty2oqrkagehhleybiylsgsc3 UNIQUE (email);


--
-- Name: students uk_e2rndfrsx22acpq2ty1caeuyw; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT uk_e2rndfrsx22acpq2ty1caeuyw UNIQUE (email);


--
-- Name: example_staff uk_fpij795n79je2jws8w3cyh3hx; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.example_staff
    ADD CONSTRAINT uk_fpij795n79je2jws8w3cyh3hx UNIQUE (staff_id);


--
-- Name: staff_roles uk_gt1y183lcaf8tq7sr2uqvlcp5; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_roles
    ADD CONSTRAINT uk_gt1y183lcaf8tq7sr2uqvlcp5 UNIQUE (role_name);


--
-- Name: teachers uk_hwllts0elb03lqv7yenjhk3dt; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teachers
    ADD CONSTRAINT uk_hwllts0elb03lqv7yenjhk3dt UNIQUE (staff_id);


--
-- Name: employees uk_j9xgmd0ya5jmus09o0b8pqrpb; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT uk_j9xgmd0ya5jmus09o0b8pqrpb UNIQUE (email);


--
-- Name: transport_routes uk_jrsd5niovubpy5y00a4flxjse; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transport_routes
    ADD CONSTRAINT uk_jrsd5niovubpy5y00a4flxjse UNIQUE (route_name);


--
-- Name: example_staff uk_jsty3x2y9oeu1bc4dnqkp6cmw; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.example_staff
    ADD CONSTRAINT uk_jsty3x2y9oeu1bc4dnqkp6cmw UNIQUE (teacher_details_id);


--
-- Name: students uk_jvirspxovaelu0hxqkeb1fwtd; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT uk_jvirspxovaelu0hxqkeb1fwtd UNIQUE (admission_id);


--
-- Name: staff uk_mk0g966eihj1xyrbh0bpe4und; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT uk_mk0g966eihj1xyrbh0bpe4und UNIQUE (staff_id);


--
-- Name: school_staff uk_nkvj584f5jom0apldd005hewv; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.school_staff
    ADD CONSTRAINT uk_nkvj584f5jom0apldd005hewv UNIQUE (staff_id);


--
-- Name: school_holidays uk_noyvhjro0yfn870lydrpkaouy; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.school_holidays
    ADD CONSTRAINT uk_noyvhjro0yfn870lydrpkaouy UNIQUE (date);


--
-- Name: staff uk_pvctx4dbua9qh4p4s3gm3scrh; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT uk_pvctx4dbua9qh4p4s3gm3scrh UNIQUE (email);


--
-- Name: users uk_r43af9ap4edm43mmtq01oddj6; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT uk_r43af9ap4edm43mmtq01oddj6 UNIQUE (username);


--
-- Name: hrm_staff uk_sv3pquyiuesqhcs80ql81j4q8; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hrm_staff
    ADD CONSTRAINT uk_sv3pquyiuesqhcs80ql81j4q8 UNIQUE (email);


--
-- Name: hrm_staff uk_tapms513pr56e9erf9p5f08ep; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hrm_staff
    ADD CONSTRAINT uk_tapms513pr56e9erf9p5f08ep UNIQUE (staff_id);


--
-- Name: staff_designations uk_toqsfxqk51s0f5s8111o1rdy0; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_designations
    ADD CONSTRAINT uk_toqsfxqk51s0f5s8111o1rdy0 UNIQUE (name);


--
-- Name: attendance ukfh0r5sfdt16udyw5quf5syvwh; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT ukfh0r5sfdt16udyw5quf5syvwh UNIQUE (student_id, date);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: flyway_schema_history_s_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX flyway_schema_history_s_idx ON public.flyway_schema_history USING btree (success);


--
-- Name: question_wise_marks fk1ihqxr74bes0oeaf2n6tlpbmf; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.question_wise_marks
    ADD CONSTRAINT fk1ihqxr74bes0oeaf2n6tlpbmf FOREIGN KEY (exam_id) REFERENCES public.exams(id);


--
-- Name: message_recipients fk1v4eg8ytqvjrfbfw63mwpmtf5; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.message_recipients
    ADD CONSTRAINT fk1v4eg8ytqvjrfbfw63mwpmtf5 FOREIGN KEY (message_id) REFERENCES public.messages(id);


--
-- Name: employee_leaves fk49gewuj53lf7foeyfpvcharf6; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_leaves
    ADD CONSTRAINT fk49gewuj53lf7foeyfpvcharf6 FOREIGN KEY (employee_id) REFERENCES public.employees(id);


--
-- Name: question_papers fk4dfr32xv0gp0vrq76r3mcfqvc; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.question_papers
    ADD CONSTRAINT fk4dfr32xv0gp0vrq76r3mcfqvc FOREIGN KEY (blueprint_id) REFERENCES public.exam_blueprints(id);


--
-- Name: exam_blueprints fk4gco7u71dd0ou646umer8c5f9; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exam_blueprints
    ADD CONSTRAINT fk4gco7u71dd0ou646umer8c5f9 FOREIGN KEY (paper_structure_id) REFERENCES public.question_paper_structures(id);


--
-- Name: question_papers fk6akic72atotbw1lw9wa30jc9c; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.question_papers
    ADD CONSTRAINT fk6akic72atotbw1lw9wa30jc9c FOREIGN KEY (exam_id) REFERENCES public.exams(id);


--
-- Name: student_fee_assignments fk6jbnej4moqp2w2wew59m2i0p2; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_fee_assignments
    ADD CONSTRAINT fk6jbnej4moqp2w2wew59m2i0p2 FOREIGN KEY (fee_structure_id) REFERENCES public.fee_structures(id);


--
-- Name: fee_payments fk6k0lkod8mk082lnbapghhrx0j; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fee_payments
    ADD CONSTRAINT fk6k0lkod8mk082lnbapghhrx0j FOREIGN KEY (student_id) REFERENCES public.students(id);


--
-- Name: payments fk6ooq278k2bs5xi8t5o6oort1v; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT fk6ooq278k2bs5xi8t5o6oort1v FOREIGN KEY (student_id) REFERENCES public.students(id);


--
-- Name: staff_designation_mappings fk6su2t2ih0jhpxwmpjovx5b4a8; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_designation_mappings
    ADD CONSTRAINT fk6su2t2ih0jhpxwmpjovx5b4a8 FOREIGN KEY (staff_id) REFERENCES public.hrm_staff(id);


--
-- Name: message_read_status fk6v2gsesvjkhu2n73ye3qig78; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.message_read_status
    ADD CONSTRAINT fk6v2gsesvjkhu2n73ye3qig78 FOREIGN KEY (message_id) REFERENCES public.messages(id);


--
-- Name: attendance fk7121lveuhtmu9wa6m90ayd5yg; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.attendance
    ADD CONSTRAINT fk7121lveuhtmu9wa6m90ayd5yg FOREIGN KEY (student_id) REFERENCES public.students(id);


--
-- Name: chapter_distributions fk7frt4penv6klpadxj1nc3esoh; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chapter_distributions
    ADD CONSTRAINT fk7frt4penv6klpadxj1nc3esoh FOREIGN KEY (blueprint_id) REFERENCES public.exam_blueprints(id);


--
-- Name: question_wise_marks fk7jfsk4luklg4g0boq35ntexrk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.question_wise_marks
    ADD CONSTRAINT fk7jfsk4luklg4g0boq35ntexrk FOREIGN KEY (question_id) REFERENCES public.questions(id);


--
-- Name: staff fk8m0hnisnt7i5lcfixu2i6e3dk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT fk8m0hnisnt7i5lcfixu2i6e3dk FOREIGN KEY (role_id) REFERENCES public.staff_roles(id);


--
-- Name: exam_blueprints fk8nmkgxvb5nveu4kprfp2v3xyn; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exam_blueprints
    ADD CONSTRAINT fk8nmkgxvb5nveu4kprfp2v3xyn FOREIGN KEY (exam_configuration_id) REFERENCES public.exam_configurations(id);


--
-- Name: students fk91agi1kr1u3d6jhvrlb9tgop0; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.students
    ADD CONSTRAINT fk91agi1kr1u3d6jhvrlb9tgop0 FOREIGN KEY (admission_id) REFERENCES public.admissions(id);


--
-- Name: hrm_staff fk94hw4marhk2clb8xkxv8cja2v; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hrm_staff
    ADD CONSTRAINT fk94hw4marhk2clb8xkxv8cja2v FOREIGN KEY (role_id) REFERENCES public.hrm_staff_roles(id);


--
-- Name: question_sections fk9cjtio5tyo8gwyaqx5abok8sa; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.question_sections
    ADD CONSTRAINT fk9cjtio5tyo8gwyaqx5abok8sa FOREIGN KEY (question_paper_structure_id) REFERENCES public.question_paper_structures(id);


--
-- Name: student_fee_assignments fk9i10wgfs8su5ui9drgna5wyyk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_fee_assignments
    ADD CONSTRAINT fk9i10wgfs8su5ui9drgna5wyyk FOREIGN KEY (student_id) REFERENCES public.students(id);


--
-- Name: question_wise_marks fka8pf93fuiopvgruwr6hd4epmi; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.question_wise_marks
    ADD CONSTRAINT fka8pf93fuiopvgruwr6hd4epmi FOREIGN KEY (student_id) REFERENCES public.students(id);


--
-- Name: detailed_exam_results fkam6y92dlsek9snhpcnawikq1l; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detailed_exam_results
    ADD CONSTRAINT fkam6y92dlsek9snhpcnawikq1l FOREIGN KEY (question_id) REFERENCES public.questions(id);


--
-- Name: hrm_staff_designation_mappings fkbskuosr3h584uie6wkad21vlu; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hrm_staff_designation_mappings
    ADD CONSTRAINT fkbskuosr3h584uie6wkad21vlu FOREIGN KEY (designation_id) REFERENCES public.hrm_staff_designations(id);


--
-- Name: fee_payments fkbuph2wfjvdo27ax7oltp5n5sq; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fee_payments
    ADD CONSTRAINT fkbuph2wfjvdo27ax7oltp5n5sq FOREIGN KEY (payment_schedule_id) REFERENCES public.payment_schedules(id);


--
-- Name: teachers fkc2t5p13sjs1us651b576915dw; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teachers
    ADD CONSTRAINT fkc2t5p13sjs1us651b576915dw FOREIGN KEY (staff_id) REFERENCES public.staff(id);


--
-- Name: staff_designation_mappings fkccl8pm9q9rh31vpt4mvmlt4y3; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_designation_mappings
    ADD CONSTRAINT fkccl8pm9q9rh31vpt4mvmlt4y3 FOREIGN KEY (designation_id) REFERENCES public.staff_designations(id);


--
-- Name: school_staff fkcdil1wiuwd69dcuxr7pgp1oq4; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.school_staff
    ADD CONSTRAINT fkcdil1wiuwd69dcuxr7pgp1oq4 FOREIGN KEY (teacher_details_id) REFERENCES public.teacher_details(id);


--
-- Name: question_paper_structures fke8rb2h6yq1xejohgbh98so58o; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.question_paper_structures
    ADD CONSTRAINT fke8rb2h6yq1xejohgbh98so58o FOREIGN KEY (exam_configuration_id) REFERENCES public.exam_configurations(id);


--
-- Name: detailed_exam_results fkemnjwjo6eobr68hw889ae3ggu; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detailed_exam_results
    ADD CONSTRAINT fkemnjwjo6eobr68hw889ae3ggu FOREIGN KEY (exam_result_id) REFERENCES public.exam_results(id);


--
-- Name: late_fees fkfmcbtxnvq92uoy8hh0vwp805i; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.late_fees
    ADD CONSTRAINT fkfmcbtxnvq92uoy8hh0vwp805i FOREIGN KEY (fee_structure_id) REFERENCES public.fee_structures(id);


--
-- Name: teachers fkfsj7fu0cvc6quxtg80ki7pmql; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teachers
    ADD CONSTRAINT fkfsj7fu0cvc6quxtg80ki7pmql FOREIGN KEY (staff_id) REFERENCES public.hrm_staff(id);


--
-- Name: questions fkg9bluntn6l5x4fvmr6f1x8l18; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.questions
    ADD CONSTRAINT fkg9bluntn6l5x4fvmr6f1x8l18 FOREIGN KEY (question_paper_id) REFERENCES public.question_papers(id);


--
-- Name: messages fki616yg0cf7kyvc0ydknq3f5hn; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT fki616yg0cf7kyvc0ydknq3f5hn FOREIGN KEY (sender_id) REFERENCES public.employees(id);


--
-- Name: exam_configurations fkji6kt5fh9u4uedc052o6qu0yw; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exam_configurations
    ADD CONSTRAINT fkji6kt5fh9u4uedc052o6qu0yw FOREIGN KEY (paper_structure_id) REFERENCES public.question_paper_structures(id);


--
-- Name: student_fee_assignments fkk91vy0gf649dq7een4cicbkr8; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_fee_assignments
    ADD CONSTRAINT fkk91vy0gf649dq7een4cicbkr8 FOREIGN KEY (transport_route_id) REFERENCES public.transport_routes(id);


--
-- Name: fee_payment_schedules fkkq3igjix8m97icd5k1r8hi0hv; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fee_payment_schedules
    ADD CONSTRAINT fkkq3igjix8m97icd5k1r8hi0hv FOREIGN KEY (student_id) REFERENCES public.students(id);


--
-- Name: school_staff fkl466ha1r1yt9ymlqrmme8rkj3; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.school_staff
    ADD CONSTRAINT fkl466ha1r1yt9ymlqrmme8rkj3 FOREIGN KEY (role_id) REFERENCES public.staff_roles(id);


--
-- Name: exam_configurations fkl5737msojqc6nfvgpjp9d26im; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exam_configurations
    ADD CONSTRAINT fkl5737msojqc6nfvgpjp9d26im FOREIGN KEY (exam_id) REFERENCES public.exams(id);


--
-- Name: staff_designation_mappings fklyycng76wfc10sbqwr1e243ao; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff_designation_mappings
    ADD CONSTRAINT fklyycng76wfc10sbqwr1e243ao FOREIGN KEY (staff_id) REFERENCES public.staff(id);


--
-- Name: fee_payments fkm0gdar1j14en6am9pe6dlmt7w; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fee_payments
    ADD CONSTRAINT fkm0gdar1j14en6am9pe6dlmt7w FOREIGN KEY (fee_structure_id) REFERENCES public.fee_structures(id);


--
-- Name: payments fkmnudkcsqmeel6ig92115cl6pm; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT fkmnudkcsqmeel6ig92115cl6pm FOREIGN KEY (fee_id) REFERENCES public.fees(id);


--
-- Name: payment_schedules fko4ulejegle1cuvm40fa3903yp; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_schedules
    ADD CONSTRAINT fko4ulejegle1cuvm40fa3903yp FOREIGN KEY (fee_structure_id) REFERENCES public.fee_structures(id);


--
-- Name: hrm_staff_designation_mappings fko95hjsivs8hwmhjtrpju7yf2k; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hrm_staff_designation_mappings
    ADD CONSTRAINT fko95hjsivs8hwmhjtrpju7yf2k FOREIGN KEY (staff_id) REFERENCES public.hrm_staff(id);


--
-- Name: example_staff fkpi6pd2hed329qmcp1nuh7qs3o; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.example_staff
    ADD CONSTRAINT fkpi6pd2hed329qmcp1nuh7qs3o FOREIGN KEY (teacher_details_id) REFERENCES public.teacher_details(id);


--
-- Name: staff fkpos05yku9lb6o2tdd8o1kxb1f; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT fkpos05yku9lb6o2tdd8o1kxb1f FOREIGN KEY (teacher_details_id) REFERENCES public.teacher_details(id);


--
-- Name: student_fee_assignments fkq0bfesw88nt3x1bm25ld1hhpu; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.student_fee_assignments
    ADD CONSTRAINT fkq0bfesw88nt3x1bm25ld1hhpu FOREIGN KEY (payment_schedule_id) REFERENCES public.payment_schedules(id);


--
-- Name: employee_leaves fkqjv7o45ughkfoxqawskrfj46m; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.employee_leaves
    ADD CONSTRAINT fkqjv7o45ughkfoxqawskrfj46m FOREIGN KEY (approved_by) REFERENCES public.employees(id);


--
-- Name: exam_results fkr7qgl670f47u65kkdm8ex5119; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exam_results
    ADD CONSTRAINT fkr7qgl670f47u65kkdm8ex5119 FOREIGN KEY (student_id) REFERENCES public.students(id);


--
-- Name: teacher_attendance fks1mqt0nyxf3m6cjcs0u36f8kk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.teacher_attendance
    ADD CONSTRAINT fks1mqt0nyxf3m6cjcs0u36f8kk FOREIGN KEY (employee_id) REFERENCES public.employees(id);


--
-- Name: exam_results fktf85ht7yquiorwjx2xbdx3fxw; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exam_results
    ADD CONSTRAINT fktf85ht7yquiorwjx2xbdx3fxw FOREIGN KEY (exam_id) REFERENCES public.exams(id);


--
-- Name: hrm_staff fktr1cflx054ishuy9pscj5ptcp; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hrm_staff
    ADD CONSTRAINT fktr1cflx054ishuy9pscj5ptcp FOREIGN KEY (role_id) REFERENCES public.staff_roles(id);


--
-- PostgreSQL database dump complete
--

