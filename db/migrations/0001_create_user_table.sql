drop table if exists public.refresh_tokens;

drop table if exists public.password_reset_tokens;

drop table if exists public.email_verification_tokens;

drop table if exists public.dependants;

DROP TABLE IF EXISTS public.users;

CREATE TABLE IF NOT EXISTS public.users
(
    id bigint NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1 ),
    public_id uuid DEFAULT gen_random_uuid(),
    first_name character varying(100) COLLATE pg_catalog."default" NOT NULL,
    last_name character varying(100) COLLATE pg_catalog."default" NOT NULL,
    gender character(1) COLLATE pg_catalog."default" NOT NULL,
    email character varying(255) COLLATE pg_catalog."default" NOT NULL,
	membership_type varchar(225),
    is_email_verified boolean NOT NULL DEFAULT false,
    email_verified_at timestamp with time zone,
    phone character varying(20) COLLATE pg_catalog."default" NOT NULL,
    is_phone_verified boolean NOT NULL DEFAULT false,
    phone_verified_at timestamp with time zone,
    is_active boolean NOT NULL DEFAULT false,
    password_hash character varying(255) COLLATE pg_catalog."default",
    last_login_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT users_email_key UNIQUE (email),
    CONSTRAINT users_public_id_key UNIQUE (public_id),
	CONSTRAINT users_phone_unique UNIQUE (phone),
    CONSTRAINT users_gender_check CHECK (gender = ANY (ARRAY['M'::bpchar, 'F'::bpchar])),
	CONSTRAINT users_membership_type_check CHECK (membership_type IN ('Individual', 'Family')),
    CONSTRAINT users_email_check CHECK (email::text ~~ '%_@__%.__%'::text)
);

create table if not exists public.dependants (
	id bigint NOT NULL GENERATED ALWAYS AS IDENTITY primary key,
	public_id uuid DEFAULT gen_random_uuid(),
	primary_member_id bigint not null REFERENCES public.users(id),
	first_name varchar(100) not null,
	last_name varchar(100) not null,
	gender char(1) not null,
	relationship varchar(100) not null, -- spouse or child
	dob date null,
	created_at timestamp with time zone not null default current_timestamp,
	updated_at timestamp with time zone default current_timestamp,
	CONSTRAINT dependents_gender_check CHECK (gender = ANY (ARRAY['M'::bpchar, 'F'::bpchar])),
	CONSTRAINT dependents_public_id_key UNIQUE (public_id)
);

CREATE TABLE IF NOT EXISTS public.email_verification_tokens (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.password_reset_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    user_id BIGINT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);