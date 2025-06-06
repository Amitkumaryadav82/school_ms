-- Table: public.admissions

-- DROP TABLE IF EXISTS public.admissions;

CREATE TABLE IF NOT EXISTS public.admissions
(
    id bigint NOT NULL DEFAULT nextval('admissions_id_seq'::regclass),
    created_at timestamp(6) without time zone NOT NULL,
    created_by character varying(255) COLLATE pg_catalog."default",
    modified_by character varying(255) COLLATE pg_catalog."default",
    updated_at timestamp(6) without time zone NOT NULL,
    applicant_name character varying(255) COLLATE pg_catalog."default",
    application_date date,
    contact_number character varying(255) COLLATE pg_catalog."default",
    date_of_birth date,
    documents oid,
    documents_format character varying(255) COLLATE pg_catalog."default",
    email character varying(255) COLLATE pg_catalog."default",
    grade_applying integer,
    guardian_contact character varying(255) COLLATE pg_catalog."default",
    guardian_email character varying(255) COLLATE pg_catalog."default",
    guardian_name character varying(255) COLLATE pg_catalog."default",
    previous_grade character varying(255) COLLATE pg_catalog."default",
    previous_percentage double precision,
    previous_school character varying(255) COLLATE pg_catalog."default",
    rejection_reason character varying(255) COLLATE pg_catalog."default",
    status character varying(255) COLLATE pg_catalog."default",
    address character varying(255) COLLATE pg_catalog."default",
    CONSTRAINT admissions_pkey PRIMARY KEY (id),
    CONSTRAINT admissions_status_check CHECK (status::text = ANY (ARRAY['PENDING'::character varying, 'UNDER_REVIEW'::character varying, 'APPROVED'::character varying, 'REJECTED'::character varying, 'WAITLISTED'::character varying, 'CANCELLED'::character varying, 'ENROLLED'::character varying]::text[]))
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.admissions
    OWNER to postgres;

    -- Table: public.attendance

-- DROP TABLE IF EXISTS public.attendance;

CREATE TABLE IF NOT EXISTS public.attendance
(
    id bigint NOT NULL DEFAULT nextval('attendance_id_seq'::regclass),
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    date date NOT NULL,
    remarks character varying(255) COLLATE pg_catalog."default",
    status character varying(255) COLLATE pg_catalog."default" NOT NULL,
    student_id bigint NOT NULL,
    created_by character varying(255) COLLATE pg_catalog."default",
    modified_by character varying(255) COLLATE pg_catalog."default",
    check_in_time time(6) without time zone,
    check_out_time time(6) without time zone,
    CONSTRAINT attendance_pkey PRIMARY KEY (id),
    CONSTRAINT ukfh0r5sfdt16udyw5quf5syvwh UNIQUE (student_id, date),
    CONSTRAINT fk7121lveuhtmu9wa6m90ayd5yg FOREIGN KEY (student_id)
        REFERENCES public.students (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.attendance
    OWNER to postgres;

    -- Table: public.class_room

-- DROP TABLE IF EXISTS public.class_room;

CREATE TABLE IF NOT EXISTS public.class_room
(
    id bigint NOT NULL DEFAULT nextval('class_room_id_seq'::regclass),
    building character varying(255) COLLATE pg_catalog."default",
    capacity integer NOT NULL,
    is_active boolean NOT NULL,
    room_number character varying(255) COLLATE pg_catalog."default",
    room_type character varying(255) COLLATE pg_catalog."default",
    CONSTRAINT class_room_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.class_room
    OWNER to postgres;

    -- Table: public.courses

-- DROP TABLE IF EXISTS public.courses;

CREATE TABLE IF NOT EXISTS public.courses
(
    id integer NOT NULL DEFAULT nextval('courses_id_seq'::regclass),
    name character varying(100) COLLATE pg_catalog."default" NOT NULL,
    department character varying(50) COLLATE pg_catalog."default" NOT NULL,
    teacher_id bigint,
    credits integer NOT NULL DEFAULT 3,
    capacity integer NOT NULL DEFAULT 30,
    enrolled integer NOT NULL DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT courses_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.courses
    OWNER to postgres;

    -- Table: public.employee_leaves

-- DROP TABLE IF EXISTS public.employee_leaves;

CREATE TABLE IF NOT EXISTS public.employee_leaves
(
    id bigint NOT NULL DEFAULT nextval('employee_leaves_id_seq'::regclass),
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    approval_date date,
    comments character varying(255) COLLATE pg_catalog."default",
    end_date date NOT NULL,
    reason character varying(255) COLLATE pg_catalog."default" NOT NULL,
    start_date date NOT NULL,
    status character varying(255) COLLATE pg_catalog."default" NOT NULL,
    type character varying(255) COLLATE pg_catalog."default" NOT NULL,
    approved_by bigint,
    employee_id bigint NOT NULL,
    CONSTRAINT employee_leaves_pkey PRIMARY KEY (id),
    CONSTRAINT fk49gewuj53lf7foeyfpvcharf6 FOREIGN KEY (employee_id)
        REFERENCES public.employees (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT fkqjv7o45ughkfoxqawskrfj46m FOREIGN KEY (approved_by)
        REFERENCES public.employees (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT employee_leaves_status_check CHECK (status::text = ANY (ARRAY['PENDING'::character varying, 'APPROVED'::character varying, 'REJECTED'::character varying, 'CANCELLED'::character varying]::text[])),
    CONSTRAINT employee_leaves_type_check CHECK (type::text = ANY (ARRAY['ANNUAL'::character varying, 'SICK'::character varying, 'MATERNITY'::character varying, 'PATERNITY'::character varying, 'UNPAID'::character varying, 'STUDY'::character varying, 'BEREAVEMENT'::character varying, 'EMERGENCY'::character varying]::text[]))
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.employee_leaves
    OWNER to postgres;

    -- Table: public.employees

-- DROP TABLE IF EXISTS public.employees;

CREATE TABLE IF NOT EXISTS public.employees
(
    id bigint NOT NULL DEFAULT nextval('employees_id_seq'::regclass),
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    department character varying(255) COLLATE pg_catalog."default" NOT NULL,
    email character varying(255) COLLATE pg_catalog."default" NOT NULL,
    first_name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    joining_date date NOT NULL,
    last_name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    phone_number character varying(255) COLLATE pg_catalog."default" NOT NULL,
    role character varying(255) COLLATE pg_catalog."default" NOT NULL,
    salary double precision NOT NULL,
    status character varying(255) COLLATE pg_catalog."default" NOT NULL,
    termination_date date,
    CONSTRAINT employees_pkey PRIMARY KEY (id),
    CONSTRAINT uk_j9xgmd0ya5jmus09o0b8pqrpb UNIQUE (email),
    CONSTRAINT employees_role_check CHECK (role::text = ANY (ARRAY['TEACHER'::character varying, 'ADMIN'::character varying, 'PRINCIPAL'::character varying, 'LIBRARIAN'::character varying, 'ACCOUNTANT'::character varying, 'COUNSELOR'::character varying, 'SUPPORT_STAFF'::character varying, 'HR_MANAGER'::character varying, 'DEPARTMENT_HEAD'::character varying]::text[])),
    CONSTRAINT employees_status_check CHECK (status::text = ANY (ARRAY['ACTIVE'::character varying, 'ON_LEAVE'::character varying, 'SUSPENDED'::character varying, 'TERMINATED'::character varying, 'RETIRED'::character varying]::text[]))
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.employees
    OWNER to postgres;

    -- Table: public.exam_results

-- DROP TABLE IF EXISTS public.exam_results;

CREATE TABLE IF NOT EXISTS public.exam_results
(
    id bigint NOT NULL DEFAULT nextval('exam_results_id_seq'::regclass),
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    marks_obtained double precision NOT NULL,
    remarks character varying(255) COLLATE pg_catalog."default",
    status character varying(255) COLLATE pg_catalog."default",
    exam_id bigint NOT NULL,
    student_id bigint NOT NULL,
    CONSTRAINT exam_results_pkey PRIMARY KEY (id),
    CONSTRAINT fkr7qgl670f47u65kkdm8ex5119 FOREIGN KEY (student_id)
        REFERENCES public.students (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT fktf85ht7yquiorwjx2xbdx3fxw FOREIGN KEY (exam_id)
        REFERENCES public.exams (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.exam_results
    OWNER to postgres;

    -- Table: public.example_staff

-- DROP TABLE IF EXISTS public.example_staff;

CREATE TABLE IF NOT EXISTS public.example_staff
(
    id bigint NOT NULL DEFAULT nextval('example_staff_id_seq'::regclass),
    active boolean NOT NULL,
    address character varying(255) COLLATE pg_catalog."default",
    date_of_birth date,
    department character varying(255) COLLATE pg_catalog."default",
    email character varying(255) COLLATE pg_catalog."default" NOT NULL,
    first_name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    joining_date date,
    last_name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    middle_name character varying(255) COLLATE pg_catalog."default",
    phone character varying(255) COLLATE pg_catalog."default",
    phone_number character varying(255) COLLATE pg_catalog."default",
    role character varying(255) COLLATE pg_catalog."default" NOT NULL,
    staff_id character varying(255) COLLATE pg_catalog."default",
    teacher_details_id bigint,
    CONSTRAINT example_staff_pkey PRIMARY KEY (id),
    CONSTRAINT uk_8pgw37s69jcvrnx5moktx2549 UNIQUE (email),
    CONSTRAINT uk_fpij795n79je2jws8w3cyh3hx UNIQUE (staff_id),
    CONSTRAINT uk_jsty3x2y9oeu1bc4dnqkp6cmw UNIQUE (teacher_details_id),
    CONSTRAINT fkpi6pd2hed329qmcp1nuh7qs3o FOREIGN KEY (teacher_details_id)
        REFERENCES public.teacher_details (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.example_staff
    OWNER to postgres;

    -- Table: public.exams

-- DROP TABLE IF EXISTS public.exams;

CREATE TABLE IF NOT EXISTS public.exams
(
    id bigint NOT NULL DEFAULT nextval('exams_id_seq'::regclass),
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    description character varying(255) COLLATE pg_catalog."default",
    exam_date timestamp(6) without time zone NOT NULL,
    exam_type character varying(255) COLLATE pg_catalog."default",
    grade integer NOT NULL,
    name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    passing_marks double precision NOT NULL,
    subject character varying(255) COLLATE pg_catalog."default",
    total_marks double precision NOT NULL,
    CONSTRAINT exams_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.exams
    OWNER to postgres;

    -- Table: public.fee_payment_schedules

-- DROP TABLE IF EXISTS public.fee_payment_schedules;

CREATE TABLE IF NOT EXISTS public.fee_payment_schedules
(
    id bigint NOT NULL DEFAULT nextval('fee_payment_schedules_id_seq'::regclass),
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    academic_year integer NOT NULL,
    change_reason character varying(255) COLLATE pg_catalog."default",
    effective_from date NOT NULL,
    effective_until date,
    frequency_change_count integer NOT NULL,
    is_active boolean NOT NULL,
    payment_frequency character varying(255) COLLATE pg_catalog."default" NOT NULL,
    student_id bigint NOT NULL,
    CONSTRAINT fee_payment_schedules_pkey PRIMARY KEY (id),
    CONSTRAINT fkkq3igjix8m97icd5k1r8hi0hv FOREIGN KEY (student_id)
        REFERENCES public.students (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT fee_payment_schedules_payment_frequency_check CHECK (payment_frequency::text = ANY (ARRAY['MONTHLY'::character varying, 'QUARTERLY'::character varying]::text[]))
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.fee_payment_schedules
    OWNER to postgres;

    -- Table: public.fee_payments

-- DROP TABLE IF EXISTS public.fee_payments;

CREATE TABLE IF NOT EXISTS public.fee_payments
(
    id bigint NOT NULL DEFAULT nextval('fee_payments_id_seq'::regclass),
    amount_paid numeric(38,2) NOT NULL,
    created_at timestamp(6) without time zone,
    payment_date date NOT NULL,
    payment_mode character varying(255) COLLATE pg_catalog."default" NOT NULL,
    remarks character varying(255) COLLATE pg_catalog."default",
    transaction_reference character varying(255) COLLATE pg_catalog."default",
    updated_at timestamp(6) without time zone,
    fee_structure_id bigint NOT NULL,
    payment_schedule_id bigint NOT NULL,
    student_id bigint NOT NULL,
    CONSTRAINT fee_payments_pkey PRIMARY KEY (id),
    CONSTRAINT fk6k0lkod8mk082lnbapghhrx0j FOREIGN KEY (student_id)
        REFERENCES public.students (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT fkbuph2wfjvdo27ax7oltp5n5sq FOREIGN KEY (payment_schedule_id)
        REFERENCES public.payment_schedules (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT fkm0gdar1j14en6am9pe6dlmt7w FOREIGN KEY (fee_structure_id)
        REFERENCES public.fee_structures (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.fee_payments
    OWNER to postgres;

    -- Table: public.fee_structures

-- DROP TABLE IF EXISTS public.fee_structures;

CREATE TABLE IF NOT EXISTS public.fee_structures
(
    id bigint NOT NULL DEFAULT nextval('fee_structures_id_seq'::regclass),
    created_at timestamp(6) without time zone NOT NULL,
    created_by character varying(255) COLLATE pg_catalog."default",
    modified_by character varying(255) COLLATE pg_catalog."default",
    updated_at timestamp(6) without time zone NOT NULL,
    annual_fees numeric(38,2) NOT NULL,
    building_fees numeric(38,2) NOT NULL,
    class_grade integer NOT NULL,
    lab_fees numeric(38,2) NOT NULL,
    CONSTRAINT fee_structures_pkey PRIMARY KEY (id),
    CONSTRAINT uk_aah48ovq4we0avcmdfofdxa8 UNIQUE (class_grade)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.fee_structures
    OWNER to postgres;

    -- Table: public.fees

-- DROP TABLE IF EXISTS public.fees;

CREATE TABLE IF NOT EXISTS public.fees
(
    id bigint NOT NULL DEFAULT nextval('fees_id_seq'::regclass),
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    amount double precision NOT NULL,
    description character varying(255) COLLATE pg_catalog."default",
    due_date date NOT NULL,
    fee_type character varying(255) COLLATE pg_catalog."default" NOT NULL,
    frequency character varying(255) COLLATE pg_catalog."default" NOT NULL,
    grade integer NOT NULL,
    name character varying(255) COLLATE pg_catalog."default",
    CONSTRAINT fees_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.fees
    OWNER to postgres;

    -- Table: public.in_app_notifications

-- DROP TABLE IF EXISTS public.in_app_notifications;

CREATE TABLE IF NOT EXISTS public.in_app_notifications
(
    id bigint NOT NULL DEFAULT nextval('in_app_notifications_id_seq'::regclass),
    content text COLLATE pg_catalog."default",
    created_at timestamp(6) without time zone,
    read_at timestamp(6) without time zone,
    recipient character varying(255) COLLATE pg_catalog."default" NOT NULL,
    status character varying(255) COLLATE pg_catalog."default",
    subject character varying(255) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT in_app_notifications_pkey PRIMARY KEY (id),
    CONSTRAINT in_app_notifications_status_check CHECK (status::text = ANY (ARRAY['UNREAD'::character varying, 'READ'::character varying, 'ARCHIVED'::character varying, 'DELETED'::character varying]::text[]))
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.in_app_notifications
    OWNER to postgres;

    -- Table: public.late_fees

-- DROP TABLE IF EXISTS public.late_fees;

CREATE TABLE IF NOT EXISTS public.late_fees
(
    id bigint NOT NULL DEFAULT nextval('late_fees_id_seq'::regclass),
    created_at timestamp(6) without time zone,
    fine_amount numeric(38,2) NOT NULL,
    fine_description character varying(255) COLLATE pg_catalog."default",
    late_fee_amount numeric(38,2) NOT NULL,
    late_fee_description character varying(255) COLLATE pg_catalog."default",
    month integer NOT NULL,
    updated_at timestamp(6) without time zone,
    fee_structure_id bigint NOT NULL,
    CONSTRAINT late_fees_pkey PRIMARY KEY (id),
    CONSTRAINT fkfmcbtxnvq92uoy8hh0vwp805i FOREIGN KEY (fee_structure_id)
        REFERENCES public.fee_structures (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.late_fees
    OWNER to postgres;

    -- Table: public.message_read_status

-- DROP TABLE IF EXISTS public.message_read_status;

CREATE TABLE IF NOT EXISTS public.message_read_status
(
    message_id bigint NOT NULL,
    read_by character varying(255) COLLATE pg_catalog."default",
    CONSTRAINT fk6v2gsesvjkhu2n73ye3qig78 FOREIGN KEY (message_id)
        REFERENCES public.messages (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.message_read_status
    OWNER to postgres;

    -- Table: public.message_recipients

-- DROP TABLE IF EXISTS public.message_recipients;

CREATE TABLE IF NOT EXISTS public.message_recipients
(
    message_id bigint NOT NULL,
    recipients character varying(255) COLLATE pg_catalog."default",
    CONSTRAINT fk1v4eg8ytqvjrfbfw63mwpmtf5 FOREIGN KEY (message_id)
        REFERENCES public.messages (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.message_recipients
    OWNER to postgres;

    -- Table: public.messages

-- DROP TABLE IF EXISTS public.messages;

CREATE TABLE IF NOT EXISTS public.messages
(
    id bigint NOT NULL DEFAULT nextval('messages_id_seq'::regclass),
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    content text COLLATE pg_catalog."default" NOT NULL,
    message_type character varying(255) COLLATE pg_catalog."default" NOT NULL,
    priority character varying(255) COLLATE pg_catalog."default" NOT NULL,
    send_time timestamp(6) without time zone NOT NULL,
    subject character varying(255) COLLATE pg_catalog."default" NOT NULL,
    sender_id bigint NOT NULL,
    CONSTRAINT messages_pkey PRIMARY KEY (id),
    CONSTRAINT fki616yg0cf7kyvc0ydknq3f5hn FOREIGN KEY (sender_id)
        REFERENCES public.employees (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT messages_message_type_check CHECK (message_type::text = ANY (ARRAY['ANNOUNCEMENT'::character varying, 'STAFF_NOTICE'::character varying, 'EMERGENCY_ALERT'::character varying, 'GENERAL_MESSAGE'::character varying, 'EVENT_NOTIFICATION'::character varying, 'ACADEMIC_UPDATE'::character varying]::text[])),
    CONSTRAINT messages_priority_check CHECK (priority::text = ANY (ARRAY['LOW'::character varying, 'MEDIUM'::character varying, 'HIGH'::character varying, 'URGENT'::character varying]::text[]))
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.messages
    OWNER to postgres;

    -- Table: public.payment_schedules

-- DROP TABLE IF EXISTS public.payment_schedules;

CREATE TABLE IF NOT EXISTS public.payment_schedules
(
    id bigint NOT NULL DEFAULT nextval('payment_schedules_id_seq'::regclass),
    amount numeric(38,2) NOT NULL,
    created_at timestamp(6) without time zone,
    is_enabled boolean NOT NULL,
    schedule_type character varying(255) COLLATE pg_catalog."default" NOT NULL,
    updated_at timestamp(6) without time zone,
    fee_structure_id bigint NOT NULL,
    CONSTRAINT payment_schedules_pkey PRIMARY KEY (id),
    CONSTRAINT fko4ulejegle1cuvm40fa3903yp FOREIGN KEY (fee_structure_id)
        REFERENCES public.fee_structures (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT payment_schedules_schedule_type_check CHECK (schedule_type::text = ANY (ARRAY['MONTHLY'::character varying, 'QUARTERLY'::character varying, 'YEARLY'::character varying]::text[]))
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.payment_schedules
    OWNER to postgres;

    -- Table: public.payments

-- DROP TABLE IF EXISTS public.payments;

CREATE TABLE IF NOT EXISTS public.payments
(
    id bigint NOT NULL DEFAULT nextval('payments_id_seq'::regclass),
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    amount double precision NOT NULL,
    payment_date timestamp(6) without time zone NOT NULL,
    payment_method character varying(255) COLLATE pg_catalog."default" NOT NULL,
    remarks character varying(255) COLLATE pg_catalog."default",
    status character varying(255) COLLATE pg_catalog."default" NOT NULL,
    transaction_reference character varying(255) COLLATE pg_catalog."default",
    fee_id bigint NOT NULL,
    student_id bigint NOT NULL,
    payer_contact_info character varying(255) COLLATE pg_catalog."default",
    payer_name character varying(255) COLLATE pg_catalog."default",
    payer_relation_to_student character varying(255) COLLATE pg_catalog."default",
    receipt_number character varying(255) COLLATE pg_catalog."default",
    CONSTRAINT payments_pkey PRIMARY KEY (id),
    CONSTRAINT fk6ooq278k2bs5xi8t5o6oort1v FOREIGN KEY (student_id)
        REFERENCES public.students (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT fkmnudkcsqmeel6ig92115cl6pm FOREIGN KEY (fee_id)
        REFERENCES public.fees (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.payments
    OWNER to postgres;

    -- Table: public.school_holidays

-- DROP TABLE IF EXISTS public.school_holidays;

CREATE TABLE IF NOT EXISTS public.school_holidays
(
    id bigint NOT NULL DEFAULT nextval('school_holidays_id_seq'::regclass),
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    date date NOT NULL,
    description character varying(255) COLLATE pg_catalog."default",
    name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    type character varying(255) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT school_holidays_pkey PRIMARY KEY (id),
    CONSTRAINT uk_noyvhjro0yfn870lydrpkaouy UNIQUE (date),
    CONSTRAINT school_holidays_type_check CHECK (type::text = ANY (ARRAY['NATIONAL_HOLIDAY'::character varying, 'RELIGIOUS_HOLIDAY'::character varying, 'SCHOOL_FUNCTION'::character varying, 'OTHER'::character varying]::text[]))
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.school_holidays
    OWNER to postgres;

    -- Table: public.staff

-- DROP TABLE IF EXISTS public.staff;

CREATE TABLE IF NOT EXISTS public.staff
(
    id bigint NOT NULL DEFAULT nextval('staff_id_seq'::regclass),
    address text COLLATE pg_catalog."default",
    blood_group character varying(255) COLLATE pg_catalog."default",
    created_at timestamp(6) without time zone,
    date_of_birth date,
    email character varying(255) COLLATE pg_catalog."default" NOT NULL,
    emergency_contact character varying(255) COLLATE pg_catalog."default",
    first_name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    gender character varying(255) COLLATE pg_catalog."default",
    is_active boolean,
    join_date date NOT NULL,
    last_name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    phone_number character varying(255) COLLATE pg_catalog."default",
    profile_image character varying(255) COLLATE pg_catalog."default",
    qualifications text COLLATE pg_catalog."default",
    staff_id character varying(255) COLLATE pg_catalog."default" NOT NULL,
    updated_at timestamp(6) without time zone,
    user_id bigint,
    role_id bigint NOT NULL,
    employment_status character varying(255) COLLATE pg_catalog."default",
    termination_date date,
    pf_uan character varying(50) COLLATE pg_catalog."default",
    gratuity character varying(50) COLLATE pg_catalog."default",
    service_end_date date,
    basic_salary double precision,
    hra double precision,
    da double precision,
    ta double precision,
    other_allowances double precision,
    pf_contribution double precision,
    tax_deduction double precision,
    net_salary double precision,
    salary_account_number character varying(50) COLLATE pg_catalog."default",
    bank_name character varying(100) COLLATE pg_catalog."default",
    ifsc_code character varying(20) COLLATE pg_catalog."default",
    CONSTRAINT staff_pkey PRIMARY KEY (id),
    CONSTRAINT uk_mk0g966eihj1xyrbh0bpe4und UNIQUE (staff_id),
    CONSTRAINT uk_pvctx4dbua9qh4p4s3gm3scrh UNIQUE (email),
    CONSTRAINT fk8m0hnisnt7i5lcfixu2i6e3dk FOREIGN KEY (role_id)
        REFERENCES public.staff_roles (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT staff_employment_status_check CHECK (employment_status::text = ANY (ARRAY['ACTIVE'::character varying, 'ON_LEAVE'::character varying, 'SUSPENDED'::character varying, 'TERMINATED'::character varying, 'RETIRED'::character varying, 'RESIGNED'::character varying]::text[]))
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.staff
    OWNER to postgres;

    -- Table: public.staff_designation_mappings

-- DROP TABLE IF EXISTS public.staff_designation_mappings;

CREATE TABLE IF NOT EXISTS public.staff_designation_mappings
(
    id bigint NOT NULL DEFAULT nextval('staff_designation_mappings_id_seq'::regclass),
    assigned_date date NOT NULL,
    created_at timestamp(6) without time zone,
    is_active boolean,
    updated_at timestamp(6) without time zone,
    designation_id bigint NOT NULL,
    staff_id bigint NOT NULL,
    CONSTRAINT staff_designation_mappings_pkey PRIMARY KEY (id),
    CONSTRAINT uk4l2y19tagll1kyvoo0qpm35ir UNIQUE (staff_id, designation_id),
    CONSTRAINT fkccl8pm9q9rh31vpt4mvmlt4y3 FOREIGN KEY (designation_id)
        REFERENCES public.staff_designations (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT fklyycng76wfc10sbqwr1e243ao FOREIGN KEY (staff_id)
        REFERENCES public.staff (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.staff_designation_mappings
    OWNER to postgres;

    -- Table: public.staff_designations

-- DROP TABLE IF EXISTS public.staff_designations;

CREATE TABLE IF NOT EXISTS public.staff_designations
(
    id bigint NOT NULL DEFAULT nextval('staff_designations_id_seq'::regclass),
    created_at timestamp(6) without time zone,
    description text COLLATE pg_catalog."default",
    name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    updated_at timestamp(6) without time zone,
    CONSTRAINT staff_designations_pkey PRIMARY KEY (id),
    CONSTRAINT uk_toqsfxqk51s0f5s8111o1rdy0 UNIQUE (name)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.staff_designations
    OWNER to postgres;

    -- Table: public.staff_roles

-- DROP TABLE IF EXISTS public.staff_roles;

CREATE TABLE IF NOT EXISTS public.staff_roles
(
    id bigint NOT NULL DEFAULT nextval('staff_roles_id_seq'::regclass),
    created_at timestamp(6) without time zone,
    description character varying(255) COLLATE pg_catalog."default",
    role_name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    updated_at timestamp(6) without time zone,
    CONSTRAINT staff_roles_pkey PRIMARY KEY (id),
    CONSTRAINT uk_gt1y183lcaf8tq7sr2uqvlcp5 UNIQUE (role_name)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.staff_roles
    OWNER to postgres;

    -- Table: public.student_fee_assignments

-- DROP TABLE IF EXISTS public.student_fee_assignments;

CREATE TABLE IF NOT EXISTS public.student_fee_assignments
(
    id bigint NOT NULL DEFAULT nextval('student_fee_assignments_id_seq'::regclass),
    created_at timestamp(6) without time zone,
    effective_from date NOT NULL,
    effective_to date,
    is_active boolean NOT NULL,
    updated_at timestamp(6) without time zone,
    fee_structure_id bigint NOT NULL,
    payment_schedule_id bigint NOT NULL,
    student_id bigint NOT NULL,
    transport_route_id bigint,
    CONSTRAINT student_fee_assignments_pkey PRIMARY KEY (id),
    CONSTRAINT fk6jbnej4moqp2w2wew59m2i0p2 FOREIGN KEY (fee_structure_id)
        REFERENCES public.fee_structures (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT fk9i10wgfs8su5ui9drgna5wyyk FOREIGN KEY (student_id)
        REFERENCES public.students (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT fkk91vy0gf649dq7een4cicbkr8 FOREIGN KEY (transport_route_id)
        REFERENCES public.transport_routes (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT fkq0bfesw88nt3x1bm25ld1hhpu FOREIGN KEY (payment_schedule_id)
        REFERENCES public.payment_schedules (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.student_fee_assignments
    OWNER to postgres;

    -- Table: public.students

-- DROP TABLE IF EXISTS public.students;

CREATE TABLE IF NOT EXISTS public.students
(
    id bigint NOT NULL DEFAULT nextval('students_id_seq'::regclass),
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    address character varying(255) COLLATE pg_catalog."default",
    date_of_birth date NOT NULL,
    email character varying(255) COLLATE pg_catalog."default",
    first_name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    gender character varying(255) COLLATE pg_catalog."default" NOT NULL,
    grade integer NOT NULL,
    guardian_email character varying(255) COLLATE pg_catalog."default",
    guardian_name character varying(255) COLLATE pg_catalog."default",
    guardian_phone character varying(255) COLLATE pg_catalog."default",
    last_name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    phone_number character varying(255) COLLATE pg_catalog."default",
    status character varying(255) COLLATE pg_catalog."default",
    student_id character varying(255) COLLATE pg_catalog."default",
    created_by character varying(255) COLLATE pg_catalog."default",
    modified_by character varying(255) COLLATE pg_catalog."default",
    admission_date date,
    blood_group character varying(255) COLLATE pg_catalog."default",
    contact_number character varying(255) COLLATE pg_catalog."default",
    guardian_contact character varying(255) COLLATE pg_catalog."default",
    medical_conditions character varying(255) COLLATE pg_catalog."default",
    photo_url character varying(255) COLLATE pg_catalog."default",
    section character varying(255) COLLATE pg_catalog."default",
    admission_id bigint,
    aadhar_number character varying(255) COLLATE pg_catalog."default",
    bus_route_number character varying(255) COLLATE pg_catalog."default",
    guardian_annual_income numeric(38,2),
    guardian_occupation character varying(255) COLLATE pg_catalog."default",
    guardian_office_address character varying(255) COLLATE pg_catalog."default",
    house_alloted character varying(255) COLLATE pg_catalog."default",
    previous_school character varying(255) COLLATE pg_catalog."default",
    subjects text COLLATE pg_catalog."default",
    tc_date date,
    tc_number character varying(255) COLLATE pg_catalog."default",
    tc_reason character varying(255) COLLATE pg_catalog."default",
    transport_mode character varying(255) COLLATE pg_catalog."default",
    udise_number character varying(255) COLLATE pg_catalog."default",
    whatsapp_number character varying(255) COLLATE pg_catalog."default",
    CONSTRAINT students_pkey PRIMARY KEY (id),
    CONSTRAINT uk_5mbus2m1tm2acucrp6t627jmx UNIQUE (student_id),
    CONSTRAINT uk_e2rndfrsx22acpq2ty1caeuyw UNIQUE (email),
    CONSTRAINT uk_jvirspxovaelu0hxqkeb1fwtd UNIQUE (admission_id),
    CONSTRAINT fk91agi1kr1u3d6jhvrlb9tgop0 FOREIGN KEY (admission_id)
        REFERENCES public.admissions (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.students
    OWNER to postgres;

    -- Table: public.teacher_attendance

-- DROP TABLE IF EXISTS public.teacher_attendance;

CREATE TABLE IF NOT EXISTS public.teacher_attendance
(
    id bigint NOT NULL DEFAULT nextval('teacher_attendance_id_seq'::regclass),
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    attendance_date date NOT NULL,
    attendance_status character varying(255) COLLATE pg_catalog."default" NOT NULL,
    last_modified_by character varying(255) COLLATE pg_catalog."default",
    marked_by character varying(255) COLLATE pg_catalog."default",
    reason character varying(255) COLLATE pg_catalog."default",
    remarks character varying(255) COLLATE pg_catalog."default",
    employee_id bigint NOT NULL,
    CONSTRAINT teacher_attendance_pkey PRIMARY KEY (id),
    CONSTRAINT uk44t7oovq7wqo3edm8el46epvr UNIQUE (employee_id, attendance_date),
    CONSTRAINT fks1mqt0nyxf3m6cjcs0u36f8kk FOREIGN KEY (employee_id)
        REFERENCES public.employees (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT teacher_attendance_attendance_status_check CHECK (attendance_status::text = ANY (ARRAY['PRESENT'::character varying, 'ABSENT'::character varying, 'HALF_DAY'::character varying, 'ON_LEAVE'::character varying, 'HOLIDAY'::character varying]::text[]))
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.teacher_attendance
    OWNER to postgres;

    -- Table: public.teacher_details

-- DROP TABLE IF EXISTS public.teacher_details;

CREATE TABLE IF NOT EXISTS public.teacher_details
(
    id bigint NOT NULL DEFAULT nextval('teacher_details_id_seq'::regclass),
    created_at timestamp(6) without time zone,
    department character varying(255) COLLATE pg_catalog."default",
    qualification character varying(255) COLLATE pg_catalog."default",
    specialization character varying(255) COLLATE pg_catalog."default",
    subjects character varying(255) COLLATE pg_catalog."default",
    updated_at timestamp(6) without time zone,
    years_of_experience integer,
    CONSTRAINT teacher_details_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.teacher_details
    OWNER to postgres;

    -- Table: public.teachers

-- DROP TABLE IF EXISTS public.teachers;

CREATE TABLE IF NOT EXISTS public.teachers
(
    id bigint NOT NULL DEFAULT nextval('teachers_id_seq'::regclass),
    class_assigned_id bigint,
    created_at timestamp(6) without time zone,
    department character varying(255) COLLATE pg_catalog."default",
    is_class_teacher boolean,
    specialization character varying(255) COLLATE pg_catalog."default",
    subjects text COLLATE pg_catalog."default",
    teaching_experience integer,
    updated_at timestamp(6) without time zone,
    staff_id bigint NOT NULL,
    CONSTRAINT teachers_pkey PRIMARY KEY (id),
    CONSTRAINT uk_hwllts0elb03lqv7yenjhk3dt UNIQUE (staff_id),
    CONSTRAINT fkc2t5p13sjs1us651b576915dw FOREIGN KEY (staff_id)
        REFERENCES public.staff (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.teachers
    OWNER to postgres;

    -- Table: public.time_slots

-- DROP TABLE IF EXISTS public.time_slots;

CREATE TABLE IF NOT EXISTS public.time_slots
(
    id bigint NOT NULL DEFAULT nextval('time_slots_id_seq'::regclass),
    day_of_week character varying(255) COLLATE pg_catalog."default" NOT NULL,
    end_time time(6) without time zone NOT NULL,
    is_break boolean NOT NULL,
    slot_name character varying(255) COLLATE pg_catalog."default",
    start_time time(6) without time zone NOT NULL,
    CONSTRAINT time_slots_pkey PRIMARY KEY (id),
    CONSTRAINT time_slots_day_of_week_check CHECK (day_of_week::text = ANY (ARRAY['MONDAY'::character varying, 'TUESDAY'::character varying, 'WEDNESDAY'::character varying, 'THURSDAY'::character varying, 'FRIDAY'::character varying, 'SATURDAY'::character varying, 'SUNDAY'::character varying]::text[]))
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.time_slots
    OWNER to postgres;

    -- Table: public.timetable

-- DROP TABLE IF EXISTS public.timetable;

CREATE TABLE IF NOT EXISTS public.timetable
(
    id bigint NOT NULL DEFAULT nextval('timetable_id_seq'::regclass),
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    academic_year character varying(255) COLLATE pg_catalog."default",
    class_name character varying(255) COLLATE pg_catalog."default",
    is_active boolean NOT NULL,
    section character varying(255) COLLATE pg_catalog."default",
    valid_from date,
    valid_to date,
    CONSTRAINT timetable_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.timetable
    OWNER to postgres;

    -- Table: public.transport_routes

-- DROP TABLE IF EXISTS public.transport_routes;

CREATE TABLE IF NOT EXISTS public.transport_routes
(
    id bigint NOT NULL DEFAULT nextval('transport_routes_id_seq'::regclass),
    created_at timestamp(6) without time zone,
    fee_amount numeric(38,2) NOT NULL,
    route_description character varying(255) COLLATE pg_catalog."default",
    route_name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    updated_at timestamp(6) without time zone,
    CONSTRAINT transport_routes_pkey PRIMARY KEY (id),
    CONSTRAINT uk_jrsd5niovubpy5y00a4flxjse UNIQUE (route_name)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.transport_routes
    OWNER to postgres;


    -- Table: public.users

-- DROP TABLE IF EXISTS public.users;

CREATE TABLE IF NOT EXISTS public.users
(
    id bigint NOT NULL DEFAULT nextval('users_id_seq'::regclass),
    created_at timestamp(6) without time zone NOT NULL,
    created_by character varying(255) COLLATE pg_catalog."default",
    modified_by character varying(255) COLLATE pg_catalog."default",
    updated_at timestamp(6) without time zone NOT NULL,
    account_non_expired boolean NOT NULL,
    account_non_locked boolean NOT NULL,
    credentials_non_expired boolean NOT NULL,
    email character varying(255) COLLATE pg_catalog."default",
    enabled boolean NOT NULL,
    password character varying(255) COLLATE pg_catalog."default",
    role character varying(255) COLLATE pg_catalog."default",
    username character varying(255) COLLATE pg_catalog."default",
    full_name character varying(255) COLLATE pg_catalog."default",
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT uk_6dotkott2kjsp8vw4d0m25fb7 UNIQUE (email),
    CONSTRAINT uk_r43af9ap4edm43mmtq01oddj6 UNIQUE (username),
    CONSTRAINT users_role_check CHECK (role::text = ANY (ARRAY['ADMIN'::character varying, 'TEACHER'::character varying, 'STUDENT'::character varying, 'STAFF'::character varying, 'PARENT'::character varying, 'SYSTEM'::character varying]::text[]))
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.users
    OWNER to postgres;