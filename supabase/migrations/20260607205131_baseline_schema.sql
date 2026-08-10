

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


CREATE SCHEMA IF NOT EXISTS "hse";


ALTER SCHEMA "hse" OWNER TO "postgres";


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE TYPE "public"."asset_domain" AS ENUM (
    'time',
    'depth'
);


ALTER TYPE "public"."asset_domain" OWNER TO "postgres";


CREATE TYPE "public"."dataset_source_type" AS ENUM (
    'LAS',
    'CSV',
    'Manual'
);


ALTER TYPE "public"."dataset_source_type" OWNER TO "postgres";


CREATE TYPE "public"."event_type" AS ENUM (
    'LOT',
    'XLOT',
    'MDT_PP',
    'Kick',
    'Loss',
    'Casing'
);


ALTER TYPE "public"."event_type" OWNER TO "postgres";


CREATE TYPE "public"."interp_type" AS ENUM (
    'horizon',
    'fault'
);


ALTER TYPE "public"."interp_type" OWNER TO "postgres";


CREATE TYPE "public"."interpretation_kind" AS ENUM (
    'horizon',
    'fault',
    'polygon',
    'contact'
);


ALTER TYPE "public"."interpretation_kind" OWNER TO "postgres";


CREATE TYPE "public"."job_kind" AS ENUM (
    'import',
    'tiling',
    'convert',
    'export'
);


ALTER TYPE "public"."job_kind" OWNER TO "postgres";


CREATE TYPE "public"."job_status" AS ENUM (
    'pending',
    'running',
    'completed',
    'failed'
);


ALTER TYPE "public"."job_status" OWNER TO "postgres";


CREATE TYPE "public"."md_tvd_ref_type" AS ENUM (
    'KB',
    'DF'
);


ALTER TYPE "public"."md_tvd_ref_type" OWNER TO "postgres";


CREATE TYPE "public"."model_method_type" AS ENUM (
    'Eaton',
    'Bowers',
    'dexp'
);


ALTER TYPE "public"."model_method_type" OWNER TO "postgres";


CREATE TYPE "public"."organization_type_enum" AS ENUM (
    'customer',
    'internal',
    'partner',
    'consultant',
    'sandbox'
);


ALTER TYPE "public"."organization_type_enum" OWNER TO "postgres";


CREATE TYPE "public"."section_type" AS ENUM (
    'inline',
    'xline',
    'arbitrary'
);


ALTER TYPE "public"."section_type" OWNER TO "postgres";


CREATE TYPE "public"."sip_asset_type" AS ENUM (
    '2D',
    '3D'
);


ALTER TYPE "public"."sip_asset_type" OWNER TO "postgres";


CREATE TYPE "public"."sip_asset_type_enum" AS ENUM (
    '2D',
    '3D'
);


ALTER TYPE "public"."sip_asset_type_enum" OWNER TO "postgres";


CREATE TYPE "public"."sip_domain_type" AS ENUM (
    'TIME',
    'DEPTH'
);


ALTER TYPE "public"."sip_domain_type" OWNER TO "postgres";


CREATE TYPE "public"."sip_domain_type_enum" AS ENUM (
    'TIME',
    'DEPTH'
);


ALTER TYPE "public"."sip_domain_type_enum" OWNER TO "postgres";


CREATE TYPE "public"."sip_job_status" AS ENUM (
    'PENDING',
    'RUNNING',
    'COMPLETED',
    'FAILED',
    'CANCELLED'
);


ALTER TYPE "public"."sip_job_status" OWNER TO "postgres";


CREATE TYPE "public"."sip_job_type" AS ENUM (
    'INSPECT',
    'INGEST',
    'PYRAMID_BUILD',
    'PREVIEW_BUILD',
    'ATTRIBUTE_BUILD',
    'SURFACE_BUILD',
    'EXPORT_BUILD'
);


ALTER TYPE "public"."sip_job_type" OWNER TO "postgres";


CREATE TYPE "public"."sip_job_type_enum" AS ENUM (
    'INSPECT',
    'INGEST',
    'PYRAMID_BUILD',
    'PREVIEW_BUILD',
    'ATTRIBUTE_BUILD',
    'SURFACE_BUILD',
    'EXPORT_BUILD'
);


ALTER TYPE "public"."sip_job_type_enum" OWNER TO "postgres";


CREATE TYPE "public"."sip_status_enum" AS ENUM (
    'PENDING',
    'ACTIVE',
    'IN_PROGRESS',
    'COMPLETED',
    'FAILED',
    'ARCHIVED'
);


ALTER TYPE "public"."sip_status_enum" OWNER TO "postgres";


CREATE TYPE "public"."sip_upload_status" AS ENUM (
    'UPLOADING',
    'UPLOADED',
    'PROCESSING',
    'READY',
    'FAILED'
);


ALTER TYPE "public"."sip_upload_status" OWNER TO "postgres";


CREATE TYPE "public"."sip_visibility_enum" AS ENUM (
    'PRIVATE',
    'TEAM',
    'PUBLIC'
);


ALTER TYPE "public"."sip_visibility_enum" OWNER TO "postgres";


CREATE TYPE "public"."sip_workspace_visibility" AS ENUM (
    'PRIVATE',
    'TEAM',
    'PUBLIC'
);


ALTER TYPE "public"."sip_workspace_visibility" OWNER TO "postgres";


CREATE TYPE "public"."well_status" AS ENUM (
    'Planning',
    'Drilling',
    'Completing',
    'Producing',
    'Suspended',
    'Abandoned'
);


ALTER TYPE "public"."well_status" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "hse"."generate_action_code"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    next_id INT;
BEGIN
    next_id := nextval('hse.actions_code_seq');
    NEW.action_code := 'ACT-' || LPAD(next_id::TEXT, 6, '0');
    RETURN NEW;
END;
$$;


ALTER FUNCTION "hse"."generate_action_code"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "hse"."has_org_access"("org_id" "uuid") RETURNS boolean
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_users
    WHERE user_id = auth.uid()
    AND organization_id = org_id
  ) OR public.is_super_admin();
$$;


ALTER FUNCTION "hse"."has_org_access"("org_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."add_user_to_organization"("p_user_id" "uuid", "p_org_id" "uuid", "p_role" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
    -- Check for existing membership to prevent duplicate errors
    IF EXISTS (
        SELECT 1 FROM public.organization_users 
        WHERE organization_id = p_org_id AND user_id = p_user_id
    ) THEN
        RETURN;
    END IF;

    -- Insert new member
    INSERT INTO public.organization_users (
        organization_id,
        user_id,
        role,
        user_role,
        status,
        modules,
        apps,
        created_at,
        updated_at
    ) VALUES (
        p_org_id,
        p_user_id,
        p_role,
        p_role, -- Map role to user_role
        'active',
        ARRAY['HSE'], -- Default module
        ARRAY['hse'], -- Default apps
        NOW(),
        NOW()
    );
END;
$$;


ALTER FUNCTION "public"."add_user_to_organization"("p_user_id" "uuid", "p_org_id" "uuid", "p_role" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."block_org_members_writes"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RAISE EXCEPTION
    'org_members is deprecated. Use organization_members.';
END;
$$;


ALTER FUNCTION "public"."block_org_members_writes"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."block_organization_users_writes"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RAISE EXCEPTION
    'organization_users is deprecated. Use organization_members + organization_apps.';
END;
$$;


ALTER FUNCTION "public"."block_organization_users_writes"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."calculate_subscription_tier"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    UPDATE public.organizations
    SET subscription_tier = CASE 
        WHEN 'HSE Premium' = ANY(NEW.modules) THEN 'premium'
        ELSE 'free'
    END
    WHERE id = NEW.organization_id;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."calculate_subscription_tier"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."can_edit_project"("p_project" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE
    AS $$
  select exists (
    select 1 from public.project_members
    where project_id = p_project
      and user_id = auth.uid()
      and role in ('owner','editor')
  );
$$;


ALTER FUNCTION "public"."can_edit_project"("p_project" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."can_user_access_app"("p_user_id" "uuid", "p_app_name" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users
        WHERE id = p_user_id
        AND p_app_name = ANY(subscribed_modules)
    );
END;
$$;


ALTER FUNCTION "public"."can_user_access_app"("p_user_id" "uuid", "p_app_name" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_hse_access"("p_user_id" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_user_role text;
  v_org_id uuid;
  v_modules text[];
  v_access_level text;
  v_is_hse_only boolean;
  v_hse_enabled boolean;
BEGIN
  -- Super Admin Override (Hardcoded safety net)
  IF public.is_super_admin() THEN
     RETURN jsonb_build_object(
      'access_level', 'premium',
      'has_hse_access', true,
      'email_limit', -1,
      'image_limit', -1,
      'video_limit', -1,
      'is_hse_only', false
    );
  END IF;

  -- Get User Info
  SELECT user_role, organization_id INTO v_user_role, v_org_id
  FROM public.organization_users
  WHERE user_id = p_user_id
  LIMIT 1;

  -- If user has no organization, deny access
  IF v_org_id IS NULL THEN
    RETURN jsonb_build_object(
      'access_level', 'none',
      'has_hse_access', false
    );
  END IF;

  -- Get Org Info
  SELECT modules, is_hse_only, hse_enabled INTO v_modules, v_is_hse_only, v_hse_enabled
  FROM public.organizations
  WHERE id = v_org_id;

  -- Logic: If hse_enabled is true OR modules contains HSE, grant access.
  -- We default to TRUE for 'has_hse_access' because this is a Free platform for now.
  -- This prevents "Access Denied" for valid Suite users.
  
  v_access_level := 'free_basic';
  
  IF v_modules @> ARRAY['HSE Premium'] THEN
    v_access_level := 'premium';
  ELSIF array_length(v_modules, 1) > 1 THEN
    v_access_level := 'free_vip';
  END IF;

  RETURN jsonb_build_object(
    'access_level', v_access_level,
    'has_hse_access', true, 
    'email_limit', CASE WHEN v_access_level = 'premium' THEN -1 ELSE 25 END,
    'image_limit', CASE WHEN v_access_level = 'premium' THEN -1 ELSE 5 END,
    'video_limit', CASE WHEN v_access_level = 'premium' THEN -1 ELSE 0 END,
    'is_hse_only', coalesce(v_is_hse_only, false)
  );
END;
$$;


ALTER FUNCTION "public"."check_hse_access"("p_user_id" "uuid") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."ss_sections" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "volume_id" "uuid" NOT NULL,
    "type" "public"."section_type" NOT NULL,
    "index_int" integer,
    "path2d" "jsonb",
    "name" "text",
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."ss_sections" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_ss_section"("p_volume_id" "uuid", "p_type" "public"."section_type", "p_index_int" integer, "p_path2d" "jsonb", "p_name" "text") RETURNS "public"."ss_sections"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
declare v public.ss_sections;
begin
  insert into public.ss_sections(volume_id, type, index_int, path2d, name, created_by)
  values (p_volume_id, p_type, p_index_int, p_path2d, p_name, auth.uid())
  returning * into v;
  return v;
end$$;


ALTER FUNCTION "public"."create_ss_section"("p_volume_id" "uuid", "p_type" "public"."section_type", "p_index_int" integer, "p_path2d" "jsonb", "p_name" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."delete_organization"("org_id_to_delete" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
    BEGIN
        IF NOT is_super_admin() THEN
            RAISE EXCEPTION 'Only Super Admins can delete organizations.';
        END IF;

        DELETE FROM public.transactions WHERE organization_id = org_id_to_delete;
        DELETE FROM public.invoices WHERE organization_id = org_id_to_delete;
        DELETE FROM public.subscriptions WHERE organization_id = org_id_to_delete;
        DELETE FROM public.organization_users WHERE organization_id = org_id_to_delete;
        DELETE FROM public.organizations WHERE id = org_id_to_delete;
    END;
    $$;


ALTER FUNCTION "public"."delete_organization"("org_id_to_delete" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."enable_hse_for_organization"("p_user_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_org_id uuid;
    v_role text;
BEGIN
    -- Get user's org and role
    SELECT organization_id, user_role INTO v_org_id, v_role
    FROM public.organization_users
    WHERE user_id = p_user_id
    LIMIT 1;

    -- Validate existence
    IF v_org_id IS NULL THEN
        RAISE EXCEPTION 'User does not belong to an organization';
    END IF;

    -- Validate permissions (Allow super_admin, org_admin, and owner)
    IF v_role NOT IN ('org_admin', 'super_admin', 'owner') THEN
        -- Also check standard role column just in case
        IF NOT EXISTS (SELECT 1 FROM public.organization_users WHERE user_id = p_user_id AND role IN ('owner', 'admin')) THEN
             RAISE EXCEPTION 'Only organization admins can enable HSE';
        END IF;
    END IF;

    -- Update Organization: Enable HSE and add modules
    UPDATE public.organizations
    SET 
        hse_enabled = true,
        subscribed_modules = (
            SELECT array_agg(DISTINCT x) 
            FROM unnest(array_append(COALESCE(subscribed_modules, ARRAY[]::text[]), 'hse_free')) t(x)
        ),
        modules = (
            SELECT array_agg(DISTINCT x) 
            FROM unnest(array_append(COALESCE(modules, ARRAY[]::text[]), 'HSE')) t(x)
        )
    WHERE id = v_org_id;

    -- Update All Users in Org: Grant access to HSE Free
    UPDATE public.users
    SET subscribed_modules = (
        SELECT array_agg(DISTINCT x) 
        FROM unnest(array_append(COALESCE(subscribed_modules, ARRAY[]::text[]), 'hse_free')) t(x)
    )
    WHERE organization_id = v_org_id;

    -- Log Activity
    INSERT INTO public.app_activity_log (user_id, app_name, action, timestamp)
    VALUES (p_user_id, 'suite', 'enable_hse_free', NOW());
END;
$$;


ALTER FUNCTION "public"."enable_hse_for_organization"("p_user_id" "uuid") OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ss_jobs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid" NOT NULL,
    "kind" "public"."job_kind" NOT NULL,
    "status" "public"."job_status" DEFAULT 'pending'::"public"."job_status" NOT NULL,
    "progress" integer DEFAULT 0,
    "input" "jsonb",
    "output" "jsonb",
    "logs" "text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."ss_jobs" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."enqueue_job"("p_project_id" "uuid", "p_kind" "public"."job_kind", "p_payload" "jsonb") RETURNS "public"."ss_jobs"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
declare v public.ss_jobs;
begin
  insert into public.ss_jobs(project_id, kind, payload, status, progress, created_by)
  values (p_project_id, p_kind, p_payload, 'queued', 0, auth.uid())
  returning * into v;
  return v;
end$$;


ALTER FUNCTION "public"."enqueue_job"("p_project_id" "uuid", "p_kind" "public"."job_kind", "p_payload" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_permit_number"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.permit_number := 'WP-' || to_char(NOW(), 'YYYY-MM') || '-' || substring(md5(random()::text) from 1 for 5);
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."generate_permit_number"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_app_seat_usage_db"("p_organization_id" "uuid", "p_app_id" "text") RETURNS "jsonb"
    LANGUAGE "plpgsql" STABLE SECURITY DEFINER
    AS $$
DECLARE
    v_total int;
    v_assigned int;
    v_available int;
BEGIN
    -- Fetch Total Seats
    SELECT count(*) INTO v_total 
    FROM public.app_seat_assignments 
    WHERE organization_id = p_organization_id AND app_id = p_app_id;

    -- Fetch Assigned Seats (user_id is not null)
    SELECT count(*) INTO v_assigned 
    FROM public.app_seat_assignments 
    WHERE organization_id = p_organization_id AND app_id = p_app_id AND user_id IS NOT NULL;

    -- Calculate Available
    v_available := v_total - v_assigned;

    -- Return JSON result
    RETURN jsonb_build_object(
        'total_seats', v_total,
        'assigned_seats', v_assigned,
        'available_seats', v_available
    );
END;
$$;


ALTER FUNCTION "public"."get_app_seat_usage_db"("p_organization_id" "uuid", "p_app_id" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_constraint_def"("table_name" "text") RETURNS TABLE("constraint_name" "text", "check_clause" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT con.conname::text, pg_get_constraintdef(con.oid)::text
  FROM pg_catalog.pg_constraint con
  INNER JOIN pg_catalog.pg_class rel ON rel.oid = con.conrelid
  INNER JOIN pg_catalog.pg_namespace nsp ON nsp.oid = rel.relnamespace
  WHERE rel.relname = table_name
  AND nsp.nspname = 'public'
  AND con.contype = 'c'; -- 'c' for Check constraint
END;
$$;


ALTER FUNCTION "public"."get_constraint_def"("table_name" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_my_claim"("claim" "text") RETURNS "text"
    LANGUAGE "sql" STABLE
    AS $$
  SELECT nullif(current_setting('request.jwt.claims', true)::jsonb ->> claim, '')::TEXT;
$$;


ALTER FUNCTION "public"."get_my_claim"("claim" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_my_org_ids"() RETURNS "uuid"[]
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT COALESCE(ARRAY_AGG(organization_id), ARRAY[]::uuid[])
  FROM public.organization_members
  WHERE user_id = auth.uid();
$$;


ALTER FUNCTION "public"."get_my_org_ids"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_my_organization_id"() RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
    DECLARE
      org_id uuid;
    BEGIN
      -- It is critical to use the auth.uid() from the JWT claims, not a user-passed parameter
      SELECT organization_id INTO org_id
      FROM public.organization_users
      WHERE user_id = auth.uid()
      LIMIT 1;
      
      -- If org_id is NULL, it means the user is not associated with any organization
      IF org_id IS NULL THEN
        RAISE EXCEPTION 'User not found in any organization';
      END IF;

      RETURN org_id;
    END;
    $$;


ALTER FUNCTION "public"."get_my_organization_id"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_my_organization_role"() RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
    DECLARE
      user_role text;
    BEGIN
      SELECT role INTO user_role
      FROM public.organization_users
      WHERE user_id = auth.uid()
      LIMIT 1;
      RETURN user_role;
    END;
    $$;


ALTER FUNCTION "public"."get_my_organization_role"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_subscribed_modules"("p_user_id" "uuid") RETURNS "text"[]
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    modules TEXT[];
BEGIN
    SELECT subscribed_modules INTO modules FROM public.users WHERE id = p_user_id;
    RETURN modules;
END;
$$;


ALTER FUNCTION "public"."get_user_subscribed_modules"("p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_users_for_organization"("org_id" "uuid") RETURNS TABLE("user_id" "uuid", "email" "text", "modules" "text"[], "role" "text", "user_created_at" timestamp with time zone, "user_last_sign_in_at" timestamp with time zone)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT
        u.id,
        u.email::text,
        ou.modules::text[],
        ou.role::text,
        u.created_at,
        u.last_sign_in_at
    FROM
        public.organization_users ou
    JOIN
        auth.users u ON ou.user_id = u.id
    WHERE
        ou.organization_id = org_id;
END;
$$;


ALTER FUNCTION "public"."get_users_for_organization"("org_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_hse_signup"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  new_org_id UUID;
  meta_org_name TEXT;
  meta_full_name TEXT;
  meta_primary_app TEXT;
  meta_modules TEXT[];
  default_role TEXT := 'org_admin';
BEGIN
  -- Extract metadata
  meta_org_name := new.raw_user_meta_data->>'organization_name';
  meta_full_name := new.raw_user_meta_data->>'full_name';
  meta_primary_app := new.raw_user_meta_data->>'primary_app';
  
  -- Handle module array safely
  IF new.raw_user_meta_data->'subscribed_modules' IS NOT NULL THEN
     SELECT ARRAY(SELECT jsonb_array_elements_text(new.raw_user_meta_data->'subscribed_modules')) INTO meta_modules;
  ELSE
     meta_modules := ARRAY['hse_free'];
  END IF;

  -- Logic: Only proceed if it's an HSE signup (primary_app = 'hse') and has org name
  IF meta_primary_app = 'hse' AND meta_org_name IS NOT NULL THEN
    
    -- 1. Create Organization
    INSERT INTO public.organizations (
        name, 
        contact_email, 
        created_by, 
        app_type, 
        subscription_status, 
        hse_enabled, 
        modules,
        subscription_tier,
        created_at
    )
    VALUES (
      meta_org_name, 
      new.email, 
      new.id, 
      'hse', 
      'free',
      true,
      meta_modules,
      'free',
      NOW()
    )
    RETURNING id INTO new_org_id;

    -- 2. Add User to Organization Members
    INSERT INTO public.organization_users (
        organization_id, 
        user_id, 
        role, 
        user_role, 
        modules, 
        created_at, 
        apps
    )
    VALUES (
      new_org_id, 
      new.id, 
      'owner', 
      default_role, 
      meta_modules, 
      NOW(),
      ARRAY['hse']
    );

    -- 3. Ensure User Profile exists in public.users
    INSERT INTO public.users (
        id, 
        email, 
        primary_app, 
        subscribed_modules, 
        last_accessed_app, 
        app_preferences, 
        organization_id,
        created_at,
        updated_at
    )
    VALUES (
        new.id, 
        new.email, 
        'hse', 
        meta_modules, 
        'hse', 
        '{"hse": {"onboarding_completed": false, "preferred_language": "en", "notifications_enabled": true}}'::jsonb,
        new_org_id,
        NOW(), 
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        primary_app = EXCLUDED.primary_app,
        subscribed_modules = EXCLUDED.subscribed_modules,
        last_accessed_app = EXCLUDED.last_accessed_app,
        app_preferences = EXCLUDED.app_preferences,
        organization_id = EXCLUDED.organization_id,
        updated_at = NOW();

  END IF;

  RETURN new;
END;
$$;


ALTER FUNCTION "public"."handle_hse_signup"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_super_admin"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    IF NEW.email = ANY(ARRAY['info@petrolord.com','ayoasaolu@gmail.com','ayodejiasaolu1@gmail.com']) THEN
       -- Update organization_users if a record exists for this user
       UPDATE public.organization_users
       SET user_role = 'super_admin'
       WHERE user_id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_super_admin"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  org_id UUID;
  org_name TEXT;
  meta_full_name TEXT;
  meta_primary_app TEXT;
  meta_role TEXT;
BEGIN
  BEGIN
    RAISE LOG 'handle_new_user: Starting for user %', NEW.id;

    -- Read metadata, with sensible defaults for any missing keys
    org_id           := (NEW.raw_user_meta_data->>'organization_id')::UUID;
    org_name         := COALESCE(NEW.raw_user_meta_data->>'organization_name', NEW.email);
    meta_full_name   := COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User');
    meta_primary_app := COALESCE(NEW.raw_user_meta_data->>'primary_app', 'suite');
    meta_role        := COALESCE(NEW.raw_user_meta_data->>'role', 'owner');

    -- Defensive: clamp primary_app to known values
    IF meta_primary_app NOT IN ('suite', 'hse') THEN
      meta_primary_app := 'suite';
    END IF;

    -- ------------------------------------------------------------------------
    -- 1a. If signup flow (no org_id passed in metadata), create the org
    -- ------------------------------------------------------------------------
    IF org_id IS NULL THEN
      RAISE LOG 'handle_new_user: Creating new organization for user %', NEW.id;

      INSERT INTO public.organizations (
        name,
        contact_email,
        created_by,
        created_via,
        organization_type,
        subscription_tier,
        subscription_status,
        hse_status,
        suite_status,
        setup_completed,
        created_at
      )
      VALUES (
        org_name,
        NEW.email,
        NEW.id,
        'signup',
        'customer',
        'free',
        'active',
        'ACTIVE',                                         -- HSE is free for everyone
        CASE WHEN meta_primary_app = 'suite' THEN 'TRIAL' ELSE 'NONE' END,
        FALSE,                                            -- setup wizard not yet run
        NOW()
      )
      RETURNING id INTO org_id;
    END IF;

    -- ------------------------------------------------------------------------
    -- 1b. Upsert public.users
    -- ------------------------------------------------------------------------
    INSERT INTO public.users (
        id,
        email,
        organization_id,
        primary_app,
        subscribed_modules,
        last_accessed_app,
        app_preferences,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        NEW.email,
        org_id,
        meta_primary_app,
        ARRAY['hse_free']::text[],
        meta_primary_app,
        jsonb_build_object(
          meta_primary_app,
          jsonb_build_object(
            'onboarding_completed', FALSE,
            'preferred_language',   'en',
            'notifications_enabled', TRUE
          )
        ),
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        organization_id = EXCLUDED.organization_id,
        primary_app     = EXCLUDED.primary_app,
        updated_at      = NOW();

    -- ------------------------------------------------------------------------
    -- 1c. Add the user as an organization member (NEW table: organization_members)
    --     Replaces the deprecated organization_users insert.
    --     For signup creator: status='active', role='owner', joined NOW.
    -- ------------------------------------------------------------------------
    INSERT INTO public.organization_members (
        organization_id,
        user_id,
        full_name,
        email,
        role,
        status,
        joined_at,
        created_at,
        updated_at
    )
    VALUES (
        org_id,
        NEW.id,
        meta_full_name,
        NEW.email,
        meta_role,                                         -- 'owner'
        'active',                                          -- creator joins active, not invited
        NOW(),
        NOW(),
        NOW()
    );

    -- ------------------------------------------------------------------------
    -- 1c2. Provision app access (NEW table: organization_apps)
    --      Free HSE for every new org. Suite signups also get suite app
    --      provisioned in TRIAL state — actual entitlement gated downstream
    --      by purchased_modules and the org's suite_status.
    -- ------------------------------------------------------------------------
    INSERT INTO public.organization_apps (
        organization_id,
        app_id,
        module_id,
        seats_allocated,
        seats_used,
        status,
        created_at
    )
    VALUES (
        org_id,
        'hse',
        'hse_free',
        999,                                               -- unlimited for free tier
        0,
        'ACTIVE',
        NOW()
    );

    IF meta_primary_app = 'suite' THEN
      INSERT INTO public.organization_apps (
          organization_id,
          app_id,
          module_id,
          seats_allocated,
          seats_used,
          status,
          created_at
      )
      VALUES (
          org_id,
          'suite',
          'suite_trial',
          5,                                               -- nominal trial seat allocation
          0,
          'ACTIVE',
          NOW()
      );
    END IF;

    -- ------------------------------------------------------------------------
    -- 1d. Free HSE entitlement record in purchased_modules
    -- ------------------------------------------------------------------------
    INSERT INTO public.purchased_modules (
        organization_id,
        module_id,
        module_name,
        status,
        subscription_status,
        purchase_date,
        seats_allocated,
        auto_renew
    )
    SELECT
        org_id,
        'hse_free',
        'HSE Free Tier',
        'active',
        'active',
        NOW(),
        999,
        FALSE
    WHERE NOT EXISTS (
        SELECT 1 FROM public.purchased_modules
        WHERE organization_id = org_id AND module_id = 'hse_free'
    );

    -- ------------------------------------------------------------------------
    -- 1e. user_points_summary
    -- ------------------------------------------------------------------------
    INSERT INTO public.user_points_summary (
        user_id,
        organization_id,
        total_points,
        points_earned,
        points_redeemed,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        org_id,
        0,
        0,
        0,
        NOW(),
        NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
        organization_id = EXCLUDED.organization_id,
        updated_at      = NOW();

    -- ------------------------------------------------------------------------
    -- 1f. user_profiles
    -- ------------------------------------------------------------------------
    INSERT INTO public.user_profiles (
        id,
        org_id,
        full_name,
        updated_at
    )
    VALUES (
        NEW.id,
        org_id,
        meta_full_name,
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        org_id    = COALESCE(EXCLUDED.org_id, public.user_profiles.org_id),
        full_name = COALESCE(EXCLUDED.full_name, public.user_profiles.full_name);

    RAISE LOG 'handle_new_user: Successfully completed for user % (org %)', NEW.id, org_id;

  EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'handle_new_user: ERROR for user % - %', NEW.id, SQLERRM;
    RAISE EXCEPTION 'Failed to initialize user: %', SQLERRM;
  END;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user_profile"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- 1. Create or update user profile
  -- We use the organization_id from the inserted user record if available
  INSERT INTO public.user_profiles (id, org_id, updated_at)
  VALUES (NEW.id, NEW.organization_id, NOW())
  ON CONFLICT (id) DO UPDATE SET 
    org_id = COALESCE(EXCLUDED.org_id, public.user_profiles.org_id),
    updated_at = NOW();
  
  -- 2. Create user points summary ONLY if organization_id is present
  -- If it's missing (e.g. invite flow), it should be handled when the user accepts invite
  -- or when the organization_users record is created.
  IF NEW.organization_id IS NOT NULL THEN
      INSERT INTO public.user_points_summary (user_id, organization_id, total_points, points_earned, points_redeemed, updated_at)
      VALUES (NEW.id, NEW.organization_id, 0, 0, 0, NOW())
      ON CONFLICT (user_id, organization_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user_profile"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_updated_at_master_apps"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_updated_at_master_apps"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_org_admin_of"("check_org_id" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM organization_users
    WHERE user_id = auth.uid()
      AND organization_id = check_org_id
      AND user_role IN ('super_admin', 'org_admin')
  );
$$;


ALTER FUNCTION "public"."is_org_admin_of"("check_org_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_org_member"("org_id" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE user_id = auth.uid()
      AND organization_id = is_org_member.org_id
  );
$$;


ALTER FUNCTION "public"."is_org_member"("org_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_project_member"("p_project" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE
    AS $$
  select exists (
    select 1 from public.project_members
    where project_id = p_project
      and user_id = auth.uid()
  );
$$;


ALTER FUNCTION "public"."is_project_member"("p_project" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_super_admin"() RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
    BEGIN
        RETURN (
            SELECT auth.uid() IN (
                SELECT id FROM auth.users WHERE email = ANY(ARRAY['info@petrolord.com','ayoasaolu@gmail.com','ayodejiasaolu1@gmail.com'])
            )
        );
    END;
$$;


ALTER FUNCTION "public"."is_super_admin"() OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ss_interpretations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid" NOT NULL,
    "kind" "public"."interpretation_kind" NOT NULL,
    "name" "text" NOT NULL,
    "data" "jsonb",
    "style" "jsonb",
    "rev" integer DEFAULT 1 NOT NULL,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    "locked_by" "uuid",
    "section_id" "uuid"
);


ALTER TABLE "public"."ss_interpretations" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."lock_interpretation"("p_id" "uuid", "p_lock" boolean) RETURNS "public"."ss_interpretations"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
declare v public.ss_interpretations;
begin
  update public.ss_interpretations
  set locked_by = case when p_lock then auth.uid() else null end
  where id = p_id
    and (locked_by is null or locked_by = auth.uid())
  returning * into v;
  return v;
end$$;


ALTER FUNCTION "public"."lock_interpretation"("p_id" "uuid", "p_lock" boolean) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."manual_verify_quote"("p_quote_id" "text", "p_organization_id" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_quote record;
    v_app jsonb;
    v_app_record record;
    v_module_uuid uuid;
    v_seats int;
    v_user_id uuid;
    v_app_uuid uuid;
    v_module_slug text;
    v_app_name text;
    v_app_id_ref text;
    v_result jsonb := '{"status": "success", "processed": [], "skipped": []}'::jsonb;
    -- Fallback mapping if module_id is missing in master_apps for older records
    v_mapping jsonb := '{
        "geoscience": "f44a23a1-c0e0-4ed1-8961-91b3c6c2f091",
        "reservoir": "59fea9fb-ce7f-4534-b523-d4c0f8126032",
        "drilling": "7fbf3e09-6895-4e53-b6b5-86f928c4503e",
        "production": "d8c36e69-ccdf-454f-87ac-29ffb43ea4fb",
        "economics": "f938a5c0-257c-47f8-ac45-db4c9c96acc3",
        "assurance": "fd118d6f-5db6-423a-9eb4-b5dfdad3a199"
    }';
BEGIN
    RAISE NOTICE 'Starting manual_verify_quote for Quote: %', p_quote_id;

    -- 1. Fetch Quote Details
    SELECT * INTO v_quote FROM public.quotes 
    WHERE quote_id = p_quote_id AND organization_id = p_organization_id;

    IF NOT FOUND THEN
        RAISE NOTICE 'Quote not found: %', p_quote_id;
        RETURN jsonb_build_object(
            'status', 'not_found',
            'message', 'Quote not found for the given ID and Organization.',
            'quote_id', p_quote_id
        );
    END IF;

    -- Setup Seats & User
    v_seats := COALESCE(v_quote.seats, 7);
    v_user_id := v_quote.user_id;

    -- Fallback user: Org Owner/Admin if quote user is null
    IF v_user_id IS NULL THEN
        SELECT user_id INTO v_user_id 
        FROM public.organization_users 
        WHERE organization_id = p_organization_id AND role IN ('owner','admin')
        ORDER BY created_at ASC
        LIMIT 1;
    END IF;

    RAISE NOTICE 'User for assignment: %, Seats: %', v_user_id, v_seats;

    -- 2. Loop through Purchased Apps
    IF v_quote.apps IS NULL OR jsonb_array_length(v_quote.apps) = 0 THEN
        RAISE NOTICE 'No apps array in quote';
        RETURN jsonb_build_object('status', 'empty', 'message', 'No apps in quote');
    END IF;

    FOR v_app IN SELECT * FROM jsonb_array_elements(v_quote.apps)
    LOOP
        v_module_slug := v_app->>'module'; 
        v_app_name := TRIM(BOTH ' ' FROM (v_app->>'name'));
        v_app_id_ref := v_app->>'id';
        
        RAISE NOTICE 'Processing item: Name="%", ID="%", Module="%"', v_app_name, v_app_id_ref, v_module_slug;
        
        -- Reset record
        v_app_record := NULL;

        -- ROBUST MATCHING STRATEGY
        SELECT * INTO v_app_record 
        FROM public.master_apps 
        WHERE 
            (v_app_id_ref IS NOT NULL AND id::text = v_app_id_ref) OR -- ID Match
            (app_name ILIKE v_app_name) OR                            -- Exact Name
            (slug = v_app_name OR slug = v_app_id_ref) OR             -- Slug Match
            (app_name ILIKE v_app_name || '%') OR                     -- Starts With
            (v_app_name ILIKE app_name || '%')                        -- Contained In
        ORDER BY 
            CASE 
                WHEN (v_app_id_ref IS NOT NULL AND id::text = v_app_id_ref) THEN 1
                WHEN app_name ILIKE v_app_name THEN 2
                WHEN (slug = v_app_name OR slug = v_app_id_ref) THEN 3
                ELSE 4
            END
        LIMIT 1;

        IF v_app_record.id IS NOT NULL THEN
            v_app_uuid := v_app_record.id;
            v_module_uuid := v_app_record.module_id;
            
            -- Fallback Module UUID lookup if null in master_apps
            IF v_module_uuid IS NULL AND v_mapping ? v_module_slug THEN
                v_module_uuid := (v_mapping->>v_module_slug)::uuid;
            END IF;

            RAISE NOTICE 'MATCH FOUND: % (UUID: %) - Module: %', v_app_record.app_name, v_app_uuid, v_module_uuid;

            -- 3. Upsert Purchased Module (App Level)
            INSERT INTO public.purchased_modules (
                organization_id, 
                module_id, 
                app_id,    
                app_uuid,
                module_uuid,
                module_name, 
                seats_allocated, 
                status, 
                quote_id, 
                purchase_date, 
                expiry_date, 
                subscription_status
            ) VALUES (
                p_organization_id, 
                COALESCE(v_module_uuid::text, v_module_slug), 
                v_app_uuid::text,
                v_app_uuid,
                v_module_uuid,
                v_app_record.module,
                v_seats, 
                'active', 
                v_quote.id, -- Using UUID from quotes table
                NOW(), 
                v_quote.expiry_date, 
                'active'
            )
            ON CONFLICT (organization_id, app_id) DO UPDATE SET
                seats_allocated = EXCLUDED.seats_allocated,
                status = 'active',
                expiry_date = EXCLUDED.expiry_date;

            -- 4. Upsert Parent Module (Module Level) if needed
            IF v_module_uuid IS NOT NULL THEN
                 INSERT INTO public.purchased_modules (
                    organization_id, 
                    module_id, 
                    module_uuid,
                    module_name, 
                    seats_allocated, 
                    status, 
                    quote_id, 
                    purchase_date, 
                    expiry_date, 
                    subscription_status
                ) VALUES (
                    p_organization_id, 
                    v_module_uuid::text,
                    v_module_uuid,
                    v_module_slug,
                    v_seats, 
                    'active', 
                    v_quote.id, -- Using UUID from quotes table
                    NOW(), 
                    v_quote.expiry_date, 
                    'active'
                )
                ON CONFLICT (organization_id, module_id) WHERE app_id IS NULL DO UPDATE SET
                    status = 'active',
                    expiry_date = EXCLUDED.expiry_date;
            END IF;

            -- 5. Seat Assignments
            IF v_user_id IS NOT NULL THEN
                INSERT INTO public.app_seat_assignments (
                    organization_id, app_id, user_id, seat_number, 
                    assigned_by, is_admin_seat, created_at, updated_at
                ) VALUES (
                    p_organization_id, v_app_uuid::text, v_user_id, 1,
                    v_user_id, true, NOW(), NOW()
                )
                ON CONFLICT (organization_id, app_id, seat_number) DO UPDATE SET
                    user_id = EXCLUDED.user_id,
                    is_admin_seat = true,
                    updated_at = NOW();
            END IF;

            IF v_seats > 1 THEN
                FOR i IN 2..v_seats LOOP
                    INSERT INTO public.app_seat_assignments (
                        organization_id, app_id, user_id, seat_number, 
                        assigned_by, is_admin_seat, created_at, updated_at
                    ) VALUES (
                        p_organization_id, v_app_uuid::text, NULL, i,
                        v_user_id, false, NOW(), NOW()
                    )
                    ON CONFLICT (organization_id, app_id, seat_number) DO NOTHING;
                END LOOP;
            END IF;

            v_result := jsonb_set(v_result, '{processed}', v_result->'processed' || jsonb_build_object(
                'app', v_app_name, 
                'status', 'activated',
                'matched_master_app', v_app_record.app_name,
                'uuid', v_app_uuid
            ));
        ELSE
            RAISE WARNING 'NO MATCH for app: %', v_app_name;
             v_result := jsonb_set(v_result, '{skipped}', v_result->'skipped' || jsonb_build_object(
                'app', v_app_name, 
                'reason', 'no_match_in_master_apps'
            ));
        END IF;
    END LOOP;

    -- 6. Update Quote Status
    UPDATE public.quotes 
    SET status = 'ENTITLEMENTS_CREATED', updated_at = NOW()
    WHERE id = v_quote.id;

    RETURN v_result;
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Error in manual_verify_quote: %', SQLERRM;
    RETURN jsonb_build_object('status', 'error', 'message', SQLERRM);
END;
$$;


ALTER FUNCTION "public"."manual_verify_quote"("p_quote_id" "text", "p_organization_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."migrate_petrolord_users"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    -- Update any organization_users with null user_role to 'staff_admin'
    UPDATE public.organization_users
    SET user_role = 'staff_admin'
    WHERE user_role IS NULL;
    
    -- Ensure all organizations have a subscription tier
    UPDATE public.organizations
    SET subscription_tier = 'free'
    WHERE subscription_tier IS NULL;
END;
$$;


ALTER FUNCTION "public"."migrate_petrolord_users"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."migrate_suite_users_to_hse"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    -- Update organizations: Ensure every organization has 'HSE' in their module list (via subscriptions table if used, or org config)
    -- Assuming subscriptions table tracks modules in text[] array column named 'modules'
    UPDATE public.subscriptions
    SET modules = array_append(modules, 'HSE')
    WHERE NOT ('HSE' = ANY(modules));

    -- Update organization_users: Ensure existing super admins get the new role
    UPDATE public.organization_users
    SET user_role = 'super_admin'
    WHERE role = 'owner' OR role = 'admin' AND user_role = 'staff_admin';
    
    -- Ensure users with specific email domains (petrolord admins) are super_admin
    UPDATE public.organization_users
    SET user_role = 'super_admin'
    WHERE user_id IN (
        SELECT id FROM auth.users 
        WHERE email = ANY(ARRAY['info@petrolord.com','ayoasaolu@gmail.com','ayodejiasaolu1@gmail.com'])
    );

END;
$$;


ALTER FUNCTION "public"."migrate_suite_users_to_hse"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."save_interpretation"("p_id" "uuid", "p_project_id" "uuid", "p_volume_id" "uuid", "p_section_id" "uuid", "p_type" "public"."interp_type", "p_geom" "jsonb", "p_color" "text", "p_style" "jsonb", "p_source" "text", "p_version_id" "uuid", "p_stats" "jsonb") RETURNS "public"."ss_interpretations"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
declare v public.ss_interpretations;
begin
  if p_id is null then
    insert into public.ss_interpretations(project_id, volume_id, section_id, type, geom, color, style, source, version_id, stats, created_by)
    values (p_project_id, p_volume_id, p_section_id, p_type, p_geom, coalesce(p_color,'#ffd166'), p_style, coalesce(p_source,'manual'), p_version_id, p_stats, auth.uid())
    returning * into v;
  else
    update public.ss_interpretations
    set project_id = p_project_id,
        volume_id  = p_volume_id,
        section_id = p_section_id,
        type       = p_type,
        geom       = p_geom,
        color      = coalesce(p_color,'#ffd166'),
        style      = p_style,
        source     = coalesce(p_source,'manual'),
        version_id = p_version_id,
        stats      = p_stats
    where id = p_id
    returning * into v;
  end if;
  return v;
end$$;


ALTER FUNCTION "public"."save_interpretation"("p_id" "uuid", "p_project_id" "uuid", "p_volume_id" "uuid", "p_section_id" "uuid", "p_type" "public"."interp_type", "p_geom" "jsonb", "p_color" "text", "p_style" "jsonb", "p_source" "text", "p_version_id" "uuid", "p_stats" "jsonb") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."search_incidents"("query_embedding" "public"."vector", "similarity_threshold" double precision, "match_count" integer, "filter_incident_types" "text"[], "filter_region" "text", "filter_min_depth" integer, "filter_max_depth" integer) RETURNS TABLE("id" "uuid", "incident_type" "text", "country" "text", "region" "text", "well_name" "text", "incident_date" "date", "min_depth_ft" integer, "max_depth_ft" integer, "mud_weight_ppg" numeric, "rop_ft_hr" numeric, "summary" "text", "source_url" "text", "lat" double precision, "lon" double precision, "similarity" double precision)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY
    SELECT
        di.id,
        di.incident_type,
        di.country,
        di.region,
        di.well_name,
        di.incident_date,
        di.min_depth_ft,
        di.max_depth_ft,
        di.mud_weight_ppg,
        di.rop_ft_hr,
        di.summary,
        di.source_url,
        di.lat,
        di.lon,
        1 - (di.embedding <=> query_embedding) as similarity
    FROM
        drilling_incidents di
    WHERE
        (query_embedding IS NULL OR 1 - (di.embedding <=> query_embedding) > similarity_threshold)
        AND (filter_incident_types IS NULL OR array_length(filter_incident_types, 1) = 0 OR di.incident_type = ANY(filter_incident_types))
        AND (filter_region IS NULL OR filter_region = '' OR di.region ILIKE '%' || filter_region || '%')
        AND (filter_min_depth IS NULL OR di.min_depth_ft >= filter_min_depth)
        AND (filter_max_depth IS NULL OR di.max_depth_ft <= filter_max_depth)
    ORDER BY
        similarity DESC NULLS LAST
    LIMIT match_count;
END;
$$;


ALTER FUNCTION "public"."search_incidents"("query_embedding" "public"."vector", "similarity_threshold" double precision, "match_count" integer, "filter_incident_types" "text"[], "filter_region" "text", "filter_min_depth" integer, "filter_max_depth" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."set_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_last_accessed_app"("p_app_name" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    UPDATE public.users
    SET last_accessed_app = p_app_name,
        updated_at = NOW()
    WHERE id = auth.uid();

    INSERT INTO public.app_activity_log (user_id, app_name, action)
    VALUES (auth.uid(), p_app_name, 'access');
END;
$$;


ALTER FUNCTION "public"."update_last_accessed_app"("p_app_name" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_subscription_tier"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  UPDATE public.organizations
  SET subscription_tier = CASE 
    WHEN NEW.modules @> ARRAY['HSE Premium'] THEN 'premium'
    ELSE 'free'
  END
  WHERE id = NEW.organization_id;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_subscription_tier"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_usage_metrics_timestamp"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_usage_metrics_timestamp"() OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ss_volumes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "uri" "text" NOT NULL,
    "format" "text" DEFAULT 'zarr'::"text" NOT NULL,
    "srid" "text",
    "il_min" integer,
    "il_max" integer,
    "xl_min" integer,
    "xl_max" integer,
    "nsamp" integer,
    "dt_ms" numeric,
    "zunit" "text",
    "byte_order" "text",
    "stats" "jsonb",
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."ss_volumes" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."upsert_ss_volume"("p_id" "uuid", "p_project_id" "uuid", "p_name" "text", "p_uri" "text", "p_format" "text", "p_srid" "text", "p_il_min" integer, "p_il_max" integer, "p_xl_min" integer, "p_xl_max" integer, "p_nsamp" integer, "p_dt_ms" numeric, "p_zunit" "text", "p_byte_order" "text", "p_stats" "jsonb") RETURNS "public"."ss_volumes"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
declare v public.ss_volumes;
begin
  insert into public.ss_volumes(id, project_id, name, uri, format, srid, il_min, il_max, xl_min, xl_max, nsamp, dt_ms, zunit, byte_order, stats, created_by)
  values (coalesce(p_id, gen_random_uuid()), p_project_id, p_name, p_uri, coalesce(p_format,'zarr'), p_srid, p_il_min, p_il_max, p_xl_min, p_xl_max, p_nsamp, p_dt_ms, p_zunit, p_byte_order, p_stats, auth.uid())
  on conflict (id) do update set
    project_id = excluded.project_id,
    name       = excluded.name,
    uri        = excluded.uri,
    format     = excluded.format,
    srid       = excluded.srid,
    il_min     = excluded.il_min,
    il_max     = excluded.il_max,
    xl_min     = excluded.xl_min,
    xl_max     = excluded.xl_max,
    nsamp      = excluded.nsamp,
    dt_ms      = excluded.dt_ms,
    zunit      = excluded.zunit,
    byte_order = excluded.byte_order,
    stats      = excluded.stats;
  select * into v from public.ss_volumes where id = coalesce(p_id, (select id from public.ss_volumes where uri = p_uri limit 1));
  return v;
end$$;


ALTER FUNCTION "public"."upsert_ss_volume"("p_id" "uuid", "p_project_id" "uuid", "p_name" "text", "p_uri" "text", "p_format" "text", "p_srid" "text", "p_il_min" integer, "p_il_max" integer, "p_xl_min" integer, "p_xl_max" integer, "p_nsamp" integer, "p_dt_ms" numeric, "p_zunit" "text", "p_byte_order" "text", "p_stats" "jsonb") OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "hse"."access_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid",
    "user_id" "uuid",
    "action" "text" NOT NULL,
    "resource" "text",
    "ip_address" "text",
    "status" "text",
    "log_timestamp" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "hse"."access_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "hse"."actions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "report_id" "uuid",
    "title" "text" NOT NULL,
    "description" "text",
    "assigned_to" "uuid",
    "due_date" timestamp with time zone,
    "priority" "text" DEFAULT 'medium'::"text",
    "status" "text" DEFAULT 'open'::"text",
    "completion_notes" "text",
    "completed_at" timestamp with time zone,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "action_code" "text",
    "status_history" "jsonb",
    "meta_data" "jsonb",
    "approver_id" "uuid"
);


ALTER TABLE "hse"."actions" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "hse"."actions_code_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "hse"."actions_code_seq" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "hse"."audit_findings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid" NOT NULL,
    "finding_id" "text" NOT NULL,
    "audit_id" "uuid",
    "category" "text",
    "severity" "text",
    "description" "text",
    "location_id" "uuid",
    "status" "text" DEFAULT 'Open'::"text" NOT NULL,
    "owner_id" "uuid",
    "due_date" timestamp with time zone,
    "evidence" "jsonb",
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "hse"."audit_findings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "hse"."audit_log" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "action" character varying(100) NOT NULL,
    "table_name" character varying(100) NOT NULL,
    "record_id" "uuid",
    "old_values" "jsonb",
    "new_values" "jsonb",
    "ip_address" "inet",
    "user_agent" "text",
    "created_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "hse"."audit_log" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "hse"."audit_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid",
    "event" "text" NOT NULL,
    "user_id" "uuid",
    "details" "jsonb",
    "log_timestamp" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "hse"."audit_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "hse"."audit_schedule" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid" NOT NULL,
    "audit_id" "text" NOT NULL,
    "audit_type" "text" NOT NULL,
    "scheduled_date" timestamp with time zone NOT NULL,
    "auditor_id" "uuid",
    "location_id" "uuid",
    "status" "text" DEFAULT 'Scheduled'::"text" NOT NULL,
    "priority" "text",
    "scope" "text",
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "hse"."audit_schedule" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "hse"."competency_assessments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid" NOT NULL,
    "assessment_id" "text",
    "employee_id" "uuid",
    "competency_id" "uuid",
    "assessment_date" "date",
    "assessor_id" "uuid",
    "score" numeric,
    "level_achieved" integer,
    "feedback" "text",
    "evidence" "jsonb",
    "status" "text",
    "valid_until" "date",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "hse"."competency_assessments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "hse"."competency_framework" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid" NOT NULL,
    "competency_id" "text",
    "competency_name" "text" NOT NULL,
    "category" "text",
    "level" integer,
    "description" "text",
    "required_for" "jsonb",
    "assessment_criteria" "jsonb",
    "training_programs" "jsonb",
    "status" "text" DEFAULT 'Active'::"text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "hse"."competency_framework" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "hse"."competency_records" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid" NOT NULL,
    "record_id" "text" NOT NULL,
    "contractor_id" "uuid",
    "competency_type" "text" NOT NULL,
    "certification_date" timestamp with time zone,
    "expiry_date" timestamp with time zone,
    "status" "text" NOT NULL,
    "issuing_body" "text",
    "certificate_url" "text",
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "hse"."competency_records" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "hse"."compliance_checklists" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid" NOT NULL,
    "checklist_id" "text" NOT NULL,
    "contractor_id" "uuid",
    "checklist_type" "text",
    "date" timestamp with time zone DEFAULT "now"(),
    "status" "text" DEFAULT 'Pending'::"text",
    "completed_by" "uuid",
    "score" numeric,
    "checklist_items" "jsonb",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "hse"."compliance_checklists" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "hse"."contractor_alerts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid" NOT NULL,
    "alert_id" "text" NOT NULL,
    "contractor_id" "uuid",
    "alert_type" "text",
    "date" timestamp with time zone DEFAULT "now"(),
    "status" "text" DEFAULT 'Active'::"text",
    "priority" "text" DEFAULT 'High'::"text",
    "action_required" "text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "hse"."contractor_alerts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "hse"."contractor_communications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid" NOT NULL,
    "message_id" "text" NOT NULL,
    "contractor_id" "uuid",
    "subject" "text",
    "message_content" "text",
    "type" "text",
    "date_sent" timestamp with time zone DEFAULT "now"(),
    "status" "text" DEFAULT 'Sent'::"text",
    "priority" "text" DEFAULT 'Normal'::"text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "hse"."contractor_communications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "hse"."contractor_documents" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid" NOT NULL,
    "document_id" "text" NOT NULL,
    "contractor_id" "uuid",
    "document_type" "text" NOT NULL,
    "file_url" "text",
    "file_name" "text",
    "file_size" "text",
    "upload_date" timestamp with time zone DEFAULT "now"(),
    "expiry_date" timestamp with time zone,
    "status" "text" DEFAULT 'Valid'::"text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "hse"."contractor_documents" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "hse"."contractor_incidents" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid" NOT NULL,
    "incident_id" "text" NOT NULL,
    "contractor_id" "uuid",
    "incident_type" "text",
    "severity" "text",
    "date" timestamp with time zone,
    "location_id" "uuid",
    "status" "text" DEFAULT 'Open'::"text",
    "assigned_to" "uuid",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "hse"."contractor_incidents" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "hse"."contractor_medical_records" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid" NOT NULL,
    "record_id" "text" NOT NULL,
    "contractor_id" "uuid",
    "record_type" "text",
    "date" timestamp with time zone,
    "status" "text" DEFAULT 'Valid'::"text",
    "expiry_date" timestamp with time zone,
    "medical_officer_id" "uuid",
    "details" "jsonb",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "hse"."contractor_medical_records" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "hse"."contractor_reviews" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid" NOT NULL,
    "review_id" "text" NOT NULL,
    "contractor_id" "uuid",
    "rating" integer,
    "date" timestamp with time zone DEFAULT "now"(),
    "reviewer_id" "uuid",
    "category" "text",
    "comment" "text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "hse"."contractor_reviews" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "hse"."contractor_site_assignments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid" NOT NULL,
    "assignment_id" "text" NOT NULL,
    "contractor_id" "uuid",
    "site_id" "uuid",
    "start_date" timestamp with time zone,
    "end_date" timestamp with time zone,
    "status" "text" DEFAULT 'Active'::"text",
    "role" "text",
    "supervisor_id" "uuid",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "hse"."contractor_site_assignments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "hse"."contractors" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid" NOT NULL,
    "contractor_id" "text" NOT NULL,
    "company_name" "text" NOT NULL,
    "contact_person" "text",
    "phone" "text",
    "email" "text",
    "location_id" "uuid",
    "status" "text" DEFAULT 'Active'::"text" NOT NULL,
    "safety_rating" integer,
    "last_audit_date" timestamp with time zone,
    "assigned_site_id" "uuid",
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "hse"."contractors" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "hse"."environmental_records" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid",
    "record_type" "text" NOT NULL,
    "location_id" "uuid",
    "location_text" "text",
    "measurement_date" timestamp with time zone,
    "status" "text" DEFAULT 'compliant'::"text",
    "measurement_value" numeric,
    "unit" "text",
    "details" "jsonb" DEFAULT '{}'::"jsonb",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "hse"."environmental_records" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "hse"."exposure_log" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid",
    "user_id" "uuid",
    "exposure_type" "text" NOT NULL,
    "exposure_level" numeric,
    "exposure_unit" "text",
    "exposure_date" timestamp with time zone,
    "location_id" "uuid",
    "location_text" "text",
    "notes" "text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "hse"."exposure_log" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "hse"."external_reports" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid" NOT NULL,
    "report_id" "text" NOT NULL,
    "report_type" "text" NOT NULL,
    "audits_included" "jsonb",
    "date_range_from" timestamp with time zone,
    "date_range_to" timestamp with time zone,
    "executive_summary" "text",
    "recommendations" "text",
    "report_content" "jsonb",
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "hse"."external_reports" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "hse"."feature_flags" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "feature_name" character varying(100) NOT NULL,
    "description" "text",
    "free_tier_enabled" boolean DEFAULT false,
    "premium_tier_enabled" boolean DEFAULT true,
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "hse"."feature_flags" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "hse"."fire_drills" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid" NOT NULL,
    "drill_id" "text" NOT NULL,
    "location_text" "text",
    "date" "date" NOT NULL,
    "time" time without time zone,
    "participants" integer,
    "duration" "text",
    "result" "text",
    "notes" "text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "hse"."fire_drills" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "hse"."fire_equipment" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid" NOT NULL,
    "equipment_id" "text" NOT NULL,
    "type" "text" NOT NULL,
    "location_text" "text",
    "last_inspection_date" "date",
    "next_inspection_date" "date",
    "status" "text" NOT NULL,
    "condition" "text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "hse"."fire_equipment" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "hse"."fire_safety_records" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid" NOT NULL,
    "record_id" "text" NOT NULL,
    "type" "text" NOT NULL,
    "location_id" "uuid",
    "location_text" "text",
    "date" timestamp with time zone NOT NULL,
    "status" "text" NOT NULL,
    "assigned_to" "uuid",
    "priority" "text",
    "details" "jsonb" DEFAULT '{}'::"jsonb",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "hse"."fire_safety_records" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "hse"."health_records" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid",
    "user_id" "uuid",
    "record_type" "text" NOT NULL,
    "status" "text" DEFAULT 'active'::"text",
    "details" "jsonb" DEFAULT '{}'::"jsonb",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "hse"."health_records" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "hse"."internal_audits" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid" NOT NULL,
    "audit_id" "text" NOT NULL,
    "type" "text" NOT NULL,
    "location_id" "uuid",
    "date" timestamp with time zone,
    "auditor_id" "uuid",
    "duration" "text",
    "findings_count" integer DEFAULT 0,
    "non_conformances" integer DEFAULT 0,
    "status" "text",
    "compliance_score" numeric,
    "scope" "text",
    "findings" "jsonb",
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "hse"."internal_audits" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "hse"."project_members" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid" NOT NULL,
    "assignment_id" "text" NOT NULL,
    "project_id" "uuid",
    "member_id" "uuid",
    "role" "text",
    "assigned_date" "date" DEFAULT CURRENT_DATE,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "hse"."project_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "hse"."report_attachments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "report_id" "uuid" NOT NULL,
    "file_path" "text" NOT NULL,
    "file_type" "text",
    "file_name" "text",
    "uploaded_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "hse"."report_attachments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "hse"."reports" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "report_type" "text" NOT NULL,
    "reference_number" "text",
    "status" "text" DEFAULT 'draft'::"text",
    "title" "text" NOT NULL,
    "description" "text",
    "location" "text",
    "incident_date" timestamp with time zone,
    "reported_by" "uuid",
    "severity" "text",
    "immediate_action_taken" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    "reference_code" "text",
    "site_id" "uuid",
    "department_id" "uuid",
    "location_detail" "text",
    "hazard_category" "text",
    "immediate_controls" "text",
    "people_involved" "jsonb",
    "is_anonymous" boolean DEFAULT false,
    "attachments" "jsonb"
);


ALTER TABLE "hse"."reports" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "hse"."risk_register" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid" NOT NULL,
    "risk_id" "text" NOT NULL,
    "description" "text" NOT NULL,
    "category" "text" NOT NULL,
    "likelihood" integer NOT NULL,
    "impact" integer NOT NULL,
    "risk_score" integer GENERATED ALWAYS AS (("likelihood" * "impact")) STORED,
    "status" "text" DEFAULT 'Open'::"text" NOT NULL,
    "owner_id" "uuid",
    "mitigation_strategy" "text",
    "due_date" timestamp with time zone,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "risk_register_impact_check" CHECK ((("impact" >= 1) AND ("impact" <= 5))),
    CONSTRAINT "risk_register_likelihood_check" CHECK ((("likelihood" >= 1) AND ("likelihood" <= 5)))
);


ALTER TABLE "hse"."risk_register" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "hse"."role_definitions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "role_name" character varying(100) NOT NULL,
    "display_name" character varying(100) NOT NULL,
    "description" "text",
    "permissions" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "hse"."role_definitions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "hse"."roles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid" NOT NULL,
    "role_id" "text" NOT NULL,
    "role_name" "text" NOT NULL,
    "department_id" "uuid",
    "level" "text",
    "description" "text",
    "responsibilities" "jsonb",
    "required_skills" "jsonb",
    "required_certifications" "jsonb",
    "salary_range_min" numeric,
    "salary_range_max" numeric,
    "status" "text" DEFAULT 'Active'::"text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "hse"."roles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "hse"."safety_inductions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid" NOT NULL,
    "induction_id" "text" NOT NULL,
    "contractor_id" "uuid",
    "date" timestamp with time zone NOT NULL,
    "type" "text" NOT NULL,
    "duration" "text",
    "trainer_id" "uuid",
    "status" "text" DEFAULT 'Pending'::"text" NOT NULL,
    "score" numeric,
    "certificate_url" "text",
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "hse"."safety_inductions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "hse"."safety_moment_analytics" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid",
    "analytics_id" "text",
    "moment_id" "uuid",
    "views_count" integer DEFAULT 0,
    "downloads_count" integer DEFAULT 0,
    "engagement_rate" numeric(5,2),
    "average_rating" numeric(3,2),
    "shares_count" integer DEFAULT 0,
    "comments_count" integer DEFAULT 0,
    "last_viewed" timestamp with time zone,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "hse"."safety_moment_analytics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "hse"."safety_moment_categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid",
    "category_id" "text",
    "category_name" "text" NOT NULL,
    "description" "text",
    "status" "text" DEFAULT 'Active'::"text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "hse"."safety_moment_categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "hse"."safety_moment_comments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid",
    "comment_id" "text",
    "moment_id" "uuid",
    "user_id" "uuid",
    "comment_text" "text" NOT NULL,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "hse"."safety_moment_comments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "hse"."safety_moment_ratings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid",
    "rating_id" "text",
    "moment_id" "uuid",
    "user_id" "uuid",
    "rating" integer,
    "comment" "text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "safety_moment_ratings_rating_check" CHECK ((("rating" >= 1) AND ("rating" <= 5)))
);


ALTER TABLE "hse"."safety_moment_ratings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "hse"."safety_moment_subcategories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid",
    "subcategory_id" "text",
    "category_id" "uuid",
    "subcategory_name" "text" NOT NULL,
    "description" "text",
    "status" "text" DEFAULT 'Active'::"text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "hse"."safety_moment_subcategories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "hse"."safety_moment_templates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid",
    "template_id" "text",
    "template_name" "text" NOT NULL,
    "category_id" "uuid",
    "format" "text",
    "description" "text",
    "duration" integer,
    "difficulty_level" "text",
    "structure" "jsonb",
    "customizable_fields" "jsonb",
    "status" "text" DEFAULT 'Active'::"text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "hse"."safety_moment_templates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "hse"."safety_moments_library" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid",
    "moment_id" "text",
    "title" "text" NOT NULL,
    "category_id" "uuid",
    "subcategory_id" "uuid",
    "description" "text",
    "duration" integer,
    "difficulty_level" "text",
    "language" "text" DEFAULT 'English'::"text",
    "content" "jsonb",
    "key_points" "jsonb",
    "discussion_questions" "jsonb",
    "materials_needed" "jsonb",
    "media" "jsonb",
    "status" "text" DEFAULT 'Published'::"text",
    "rating" numeric(3,2) DEFAULT 0,
    "views_count" integer DEFAULT 0,
    "downloads_count" integer DEFAULT 0,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "hse"."safety_moments_library" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "hse"."security_incidents" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid",
    "incident_code" "text",
    "title" "text" NOT NULL,
    "type" "text" NOT NULL,
    "severity" "text",
    "status" "text" DEFAULT 'open'::"text",
    "location_id" "uuid",
    "location_text" "text",
    "assigned_to" "uuid",
    "incident_date" timestamp with time zone,
    "details" "jsonb" DEFAULT '{}'::"jsonb",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "description" "text"
);


ALTER TABLE "hse"."security_incidents" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "hse"."spill_records" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid" NOT NULL,
    "spill_id" "text" NOT NULL,
    "substance" "text" NOT NULL,
    "quantity" numeric,
    "unit" "text",
    "location_text" "text",
    "date" "date" NOT NULL,
    "time" time without time zone,
    "severity" "text" NOT NULL,
    "status" "text" NOT NULL,
    "assigned_to" "uuid",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "hse"."spill_records" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "hse"."spill_response" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid" NOT NULL,
    "response_id" "text" NOT NULL,
    "spill_id" "uuid",
    "response_type" "text" NOT NULL,
    "date" "date" NOT NULL,
    "time" time without time zone,
    "personnel_involved" "jsonb" DEFAULT '[]'::"jsonb",
    "status" "text" NOT NULL,
    "notes" "text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "hse"."spill_response" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "hse"."subscriptions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "tier" character varying(50) DEFAULT 'free'::character varying NOT NULL,
    "status" character varying(50) DEFAULT 'active'::character varying NOT NULL,
    "started_at" timestamp without time zone DEFAULT "now"(),
    "expires_at" timestamp without time zone,
    "stripe_subscription_id" character varying(255),
    "stripe_customer_id" character varying(255),
    "features" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "hse"."subscriptions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "hse"."team_communications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid" NOT NULL,
    "message_id" "text" NOT NULL,
    "from_id" "uuid",
    "to_id" "uuid",
    "subject" "text",
    "message_content" "text",
    "type" "text",
    "status" "text" DEFAULT 'Sent'::"text",
    "priority" "text" DEFAULT 'Normal'::"text",
    "attachments" "jsonb",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "hse"."team_communications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "hse"."team_members" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid" NOT NULL,
    "member_id" "text" NOT NULL,
    "first_name" "text" NOT NULL,
    "last_name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "phone" "text",
    "role_id" "uuid",
    "team_id" "uuid",
    "department_id" "uuid",
    "hire_date" "date",
    "status" "text" DEFAULT 'Active'::"text",
    "performance_rating" numeric DEFAULT 0,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "hse"."team_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "hse"."team_performance" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid" NOT NULL,
    "performance_id" "text" NOT NULL,
    "team_id" "uuid",
    "performance_date" "date",
    "completed_tasks" integer DEFAULT 0,
    "pending_tasks" integer DEFAULT 0,
    "productivity_score" numeric DEFAULT 0,
    "attendance_rate" numeric DEFAULT 0,
    "safety_score" numeric DEFAULT 0,
    "compliance_score" numeric DEFAULT 0,
    "overall_score" numeric DEFAULT 0,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "hse"."team_performance" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "hse"."team_projects" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid" NOT NULL,
    "project_id" "text" NOT NULL,
    "project_name" "text" NOT NULL,
    "team_id" "uuid",
    "start_date" "date",
    "end_date" "date",
    "status" "text" DEFAULT 'Planning'::"text",
    "progress" numeric DEFAULT 0,
    "budget" numeric,
    "description" "text",
    "objectives" "jsonb",
    "deliverables" "jsonb",
    "priority" "text" DEFAULT 'Medium'::"text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "hse"."team_projects" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "hse"."team_resources" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid" NOT NULL,
    "resource_id" "text" NOT NULL,
    "resource_name" "text" NOT NULL,
    "type" "text",
    "team_id" "uuid",
    "assigned_to" "uuid",
    "status" "text" DEFAULT 'Available'::"text",
    "quantity" integer DEFAULT 1,
    "location" "text",
    "cost" numeric,
    "maintenance_schedule" "date",
    "last_maintenance" "date",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "hse"."team_resources" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "hse"."team_tasks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid" NOT NULL,
    "task_id" "text" NOT NULL,
    "project_id" "uuid",
    "team_id" "uuid",
    "assigned_to" "uuid",
    "task_name" "text" NOT NULL,
    "description" "text",
    "start_date" "date",
    "due_date" "date",
    "status" "text" DEFAULT 'Pending'::"text",
    "priority" "text" DEFAULT 'Medium'::"text",
    "progress" numeric DEFAULT 0,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "hse"."team_tasks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "hse"."teams" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid" NOT NULL,
    "team_id" "text" NOT NULL,
    "team_name" "text" NOT NULL,
    "department_id" "uuid",
    "team_lead_id" "uuid",
    "description" "text",
    "objectives" "jsonb",
    "budget" numeric,
    "status" "text" DEFAULT 'Active'::"text",
    "performance_score" numeric DEFAULT 0,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "hse"."teams" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "hse"."training_attendance" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid" NOT NULL,
    "attendance_id" "text",
    "training_id" "uuid",
    "employee_id" "uuid",
    "attendance_status" "text",
    "check_in_time" timestamp with time zone,
    "check_out_time" timestamp with time zone,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "hse"."training_attendance" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "hse"."training_feedback" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid" NOT NULL,
    "feedback_id" "text",
    "training_id" "uuid",
    "employee_id" "uuid",
    "rating" integer,
    "content_rating" integer,
    "trainer_rating" integer,
    "venue_rating" integer,
    "comments" "text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "hse"."training_feedback" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "hse"."training_programs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid" NOT NULL,
    "program_id" "text",
    "program_name" "text" NOT NULL,
    "category" "text",
    "duration" numeric,
    "description" "text",
    "objectives" "jsonb",
    "content_outline" "jsonb",
    "target_audience" "text",
    "prerequisites" "text",
    "trainer_requirements" "text",
    "status" "text" DEFAULT 'Active'::"text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "hse"."training_programs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "hse"."training_records" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid" NOT NULL,
    "training_id" "text" NOT NULL,
    "contractor_id" "uuid",
    "training_type" "text",
    "date" timestamp with time zone,
    "duration" "text",
    "trainer_id" "uuid",
    "status" "text" DEFAULT 'Completed'::"text",
    "score" numeric,
    "certificate_url" "text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "hse"."training_records" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "hse"."training_schedule" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid" NOT NULL,
    "training_id" "text",
    "program_id" "uuid",
    "scheduled_date" "date",
    "start_time" time without time zone,
    "end_time" time without time zone,
    "location_id" "uuid",
    "trainer_id" "uuid",
    "capacity" integer,
    "enrolled_count" integer DEFAULT 0,
    "status" "text" DEFAULT 'Scheduled'::"text",
    "priority" "text",
    "materials" "jsonb",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "hse"."training_schedule" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "hse"."user_safety_moments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid" NOT NULL,
    "moment_id" "text",
    "user_id" "uuid",
    "title" "text" NOT NULL,
    "category_id" "uuid",
    "subcategory_id" "uuid",
    "description" "text",
    "duration" integer,
    "difficulty_level" "text",
    "content" "jsonb",
    "key_points" "jsonb",
    "discussion_questions" "jsonb",
    "materials_needed" "jsonb",
    "media" "jsonb",
    "status" "text" DEFAULT 'Draft'::"text",
    "scheduled_date" timestamp with time zone,
    "views_count" integer DEFAULT 0,
    "downloads_count" integer DEFAULT 0,
    "rating" numeric(3,2) DEFAULT 0,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "hse"."user_safety_moments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "hse"."waste_management" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid",
    "waste_type" "text" NOT NULL,
    "quantity" numeric,
    "unit" "text",
    "disposal_method" "text",
    "location_id" "uuid",
    "location_text" "text",
    "disposal_date" timestamp with time zone,
    "status" "text" DEFAULT 'pending_disposal'::"text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "hse"."waste_management" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."absence_records" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "absence_date" "date" NOT NULL,
    "absence_type" "text",
    "duration_days" integer DEFAULT 1,
    "reason" "text",
    "health_related" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."absence_records" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."access_audit_log" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "organization_id" "uuid",
    "app_name" "text",
    "organization_type" "text",
    "access_decision" boolean,
    "reason" "text",
    "timestamp" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."access_audit_log" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."access_credentials" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "organization_id" "uuid",
    "credential_type" "text",
    "credential_id" "text",
    "issue_date" "date",
    "expiry_date" "date",
    "status" "text",
    "access_level" "text",
    "locations_allowed" "text"[],
    "time_restrictions" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "access_credentials_credential_type_check" CHECK (("credential_type" = ANY (ARRAY['Badge'::"text", 'Card'::"text", 'Token'::"text", 'Password'::"text", 'MFA'::"text"]))),
    CONSTRAINT "access_credentials_status_check" CHECK (("status" = ANY (ARRAY['Active'::"text", 'Expired'::"text", 'Revoked'::"text", 'Lost'::"text", 'Replaced'::"text"])))
);


ALTER TABLE "public"."access_credentials" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."access_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "organization_id" "uuid",
    "access_type" "text",
    "resource_accessed" "text",
    "location" "text",
    "access_time" timestamp with time zone DEFAULT "now"(),
    "access_duration" integer,
    "status" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "access_logs_access_type_check" CHECK (("access_type" = ANY (ARRAY['Physical'::"text", 'System'::"text", 'Data'::"text"]))),
    CONSTRAINT "access_logs_status_check" CHECK (("status" = ANY (ARRAY['Granted'::"text", 'Denied'::"text"])))
);


ALTER TABLE "public"."access_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."access_requests" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "member_id" "uuid" NOT NULL,
    "app_id" "text" NOT NULL,
    "module_id" "text" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "reason" "text",
    "response" "text",
    "responded_by" "uuid",
    "requested_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "responded_at" timestamp with time zone
);


ALTER TABLE "public"."access_requests" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."actions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "status" "text" DEFAULT 'open'::"text",
    "priority" "text" DEFAULT 'medium'::"text",
    "due_date" timestamp with time zone,
    "action_code" "text",
    "assigned_to" "uuid",
    "created_by" "uuid",
    "report_id" "uuid",
    "approver_id" "uuid",
    "closure_comment" "text",
    "meta_data" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "effectiveness_score" integer,
    "completion_date" timestamp with time zone,
    "root_cause_category" "text"
);


ALTER TABLE "public"."actions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."master_apps" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "app_name" "text" NOT NULL,
    "module" "text" NOT NULL,
    "description" "text",
    "icon_url" "text",
    "status" "text" DEFAULT 'Active'::"text" NOT NULL,
    "is_functional" boolean DEFAULT true,
    "display_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "is_built" boolean DEFAULT false,
    "slug" "text",
    "module_id" "uuid"
);


ALTER TABLE "public"."master_apps" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."purchased_modules" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid",
    "module_id" "text",
    "app_id" "text",
    "module_name" "text",
    "purchase_date" timestamp with time zone DEFAULT "now"(),
    "expiry_date" timestamp with time zone,
    "status" "text",
    "quote_id" "uuid",
    "seats_allocated" integer DEFAULT 0,
    "storage_allocated_gb" integer DEFAULT 0,
    "current_seats_used" integer DEFAULT 0,
    "current_storage_used_gb" numeric(10,2) DEFAULT 0.00,
    "subscription_status" "text" DEFAULT 'active'::"text",
    "renewal_date" timestamp with time zone,
    "auto_renew" boolean DEFAULT true,
    "cancellation_date" timestamp with time zone,
    "cancellation_reason" "text",
    "cancelled_by" "uuid",
    "next_billing_date" timestamp with time zone,
    "last_renewal_date" timestamp with time zone,
    "module_uuid" "uuid",
    "app_uuid" "uuid"
);


ALTER TABLE "public"."purchased_modules" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."admin_data_integrity_report" AS
 SELECT 'Orphaned Purchases'::"text" AS "issue_type",
    "count"(*) AS "count",
    'purchased_modules records with no matching master_app'::"text" AS "description"
   FROM "public"."purchased_modules"
  WHERE ("purchased_modules"."app_uuid" IS NULL)
UNION ALL
 SELECT 'Unlinked Apps'::"text" AS "issue_type",
    "count"(*) AS "count",
    'master_apps with no module_id'::"text" AS "description"
   FROM "public"."master_apps"
  WHERE ("master_apps"."module_id" IS NULL);


ALTER VIEW "public"."admin_data_integrity_report" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."afe_changes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "afe_id" "uuid" NOT NULL,
    "description" "text" NOT NULL,
    "amount" numeric NOT NULL,
    "reason" "text",
    "status" "text" DEFAULT 'Pending'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."afe_changes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."afe_cost_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "afe_id" "uuid" NOT NULL,
    "code" "text" NOT NULL,
    "description" "text" NOT NULL,
    "budget" numeric NOT NULL,
    "commitment" numeric DEFAULT 0,
    "actual" numeric DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "category" "text" DEFAULT 'General'::"text",
    "wbs_code" "text",
    "vendor" "text",
    "forecast" numeric DEFAULT 0,
    "progress" numeric DEFAULT 0
);


ALTER TABLE "public"."afe_cost_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."afe_invoices" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "afe_id" "uuid" NOT NULL,
    "cost_item_id" "uuid",
    "vendor" "text" NOT NULL,
    "invoice_number" "text" NOT NULL,
    "amount" numeric NOT NULL,
    "invoice_date" "date" NOT NULL,
    "status" "text" DEFAULT 'Pending'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."afe_invoices" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."afes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "project_id" "uuid",
    "afe_number" "text" NOT NULL,
    "afe_name" "text" NOT NULL,
    "budget" numeric NOT NULL,
    "status" "text" DEFAULT 'Draft'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "currency" "text" DEFAULT 'USD'::"text",
    "class" "text" DEFAULT 'Budget'::"text",
    "operator_share" numeric DEFAULT 100,
    "partner_share" numeric DEFAULT 0,
    "description" "text",
    "start_date" "date",
    "end_date" "date"
);


ALTER TABLE "public"."afes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ai_insights" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid",
    "type" "text" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "confidence_score" numeric,
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."ai_insights" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."alerts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "well_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "message" "text" NOT NULL,
    "is_open" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "module" "text",
    "organization_id" "uuid",
    "alert_type" "text",
    "title" "text",
    "description" "text",
    "source" "text",
    "recommended_action" "text",
    "expected_impact" "text",
    "deadline" timestamp with time zone,
    "status" "text" DEFAULT 'active'::"text"
);


ALTER TABLE "public"."alerts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."allocations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "well_id" "text" NOT NULL,
    "allocated_amount" numeric NOT NULL,
    "actual_amount" numeric,
    "period" "text" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."allocations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."analytics_insights" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid",
    "date" "date" NOT NULL,
    "total_reports" integer DEFAULT 0,
    "critical_reports" integer DEFAULT 0,
    "avg_resolution_hours" numeric DEFAULT 0,
    "top_severity" "text",
    "top_location" "text",
    "top_category" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."analytics_insights" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."annuli" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "well_id" "uuid" NOT NULL,
    "casing_string_id" "uuid" NOT NULL,
    "external_fluid" "text",
    "internal_fluid" "text",
    "cement_top_md_m" numeric,
    "cement_props" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."annuli" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."anticollision_checks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "trajectory_plan_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "results" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."anticollision_checks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."api_keys" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid",
    "key_prefix" "text" NOT NULL,
    "key_hash" "text" NOT NULL,
    "label" "text",
    "scopes" "text"[],
    "last_used_at" timestamp with time zone,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "is_active" boolean DEFAULT true
);


ALTER TABLE "public"."api_keys" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."app_activity_log" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "app_name" "text" NOT NULL,
    "action" "text" NOT NULL,
    "timestamp" timestamp with time zone DEFAULT "now"(),
    "ip_address" "text",
    "user_agent" "text"
);


ALTER TABLE "public"."app_activity_log" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."app_analytics_daily" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "app_id" "text" NOT NULL,
    "date" "date" NOT NULL,
    "active_users_count" integer DEFAULT 0,
    "total_sessions" integer DEFAULT 0,
    "avg_session_duration_seconds" numeric,
    "events_count" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."app_analytics_daily" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."app_seat_assignments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "app_id" "text" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "seat_number" integer NOT NULL,
    "assigned_by" "uuid",
    "is_admin_seat" boolean DEFAULT false,
    "is_locked" boolean DEFAULT false,
    "reassigned_from_admin" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."app_seat_assignments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."apps" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "module_id" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "price" numeric DEFAULT 99.00,
    "status" "text" DEFAULT 'ACTIVE'::"text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."apps" OWNER TO "postgres";


COMMENT ON TABLE "public"."apps" IS 'LEGACY TABLE: Deprecated in favor of master_apps. Do not use for new development.';



CREATE TABLE IF NOT EXISTS "public"."artificial_lift_designs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "design_name" "text" NOT NULL,
    "design_description" "text",
    "design_data" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."artificial_lift_designs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."asset_summary" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "asset_name" "text" NOT NULL,
    "user_id" "uuid",
    "total_value" numeric,
    "total_spend" numeric,
    "rag_status" "text",
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."asset_summary" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."audit_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "action" "text" NOT NULL,
    "details" "jsonb",
    "actor_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."audit_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."available_modules" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "module_name" "text" NOT NULL,
    "display_name" "text" NOT NULL,
    "description" "text",
    "is_free" boolean DEFAULT false,
    "is_paid" boolean DEFAULT false,
    "app_type" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."available_modules" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."badge_definitions" (
    "id" character varying(50) NOT NULL,
    "name" character varying(255) NOT NULL,
    "description" "text",
    "icon" character varying(10),
    "requirement_type" character varying(50),
    "requirement_count" integer,
    "rarity" character varying(20) DEFAULT 'common'::character varying
);


ALTER TABLE "public"."badge_definitions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."behavioral_anomalies" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "organization_id" "uuid",
    "anomaly_type" "text",
    "severity" "text",
    "description" "text",
    "detected_date" timestamp with time zone DEFAULT "now"(),
    "investigation_status" "text",
    "investigation_notes" "text",
    "insider_threat_score" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "behavioral_anomalies_investigation_status_check" CHECK (("investigation_status" = ANY (ARRAY['Detected'::"text", 'Under Review'::"text", 'Investigated'::"text", 'Resolved'::"text"]))),
    CONSTRAINT "behavioral_anomalies_severity_check" CHECK (("severity" = ANY (ARRAY['Low'::"text", 'Medium'::"text", 'High'::"text", 'Critical'::"text"])))
);


ALTER TABLE "public"."behavioral_anomalies" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."benchmarking_data" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid",
    "metric_name" "text",
    "org_value" numeric,
    "industry_avg" numeric,
    "top_quartile" numeric,
    "category" "text",
    "period_start" "date",
    "period_end" "date",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."benchmarking_data" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."bf_activity_log" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "project_id" "uuid",
    "well_id" "uuid",
    "user_id" "uuid",
    "action" "text" NOT NULL,
    "details" "jsonb",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."bf_activity_log" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."bf_comments" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "project_id" "uuid",
    "well_id" "uuid",
    "user_id" "uuid",
    "context" "text",
    "message" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "resolved" boolean DEFAULT false
);


ALTER TABLE "public"."bf_comments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."bf_jobs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "job_type" "text" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text",
    "payload" "jsonb",
    "result" "jsonb",
    "progress" integer DEFAULT 0,
    "error_message" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."bf_jobs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."bf_projects" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "stratigraphy" "jsonb" DEFAULT '[]'::"jsonb",
    "thermal_parameters" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."bf_projects" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."bf_team_members" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "project_id" "uuid",
    "user_id" "uuid",
    "role" "text" NOT NULL,
    "joined_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "bf_team_members_role_check" CHECK (("role" = ANY (ARRAY['owner'::"text", 'editor'::"text", 'viewer'::"text"])))
);


ALTER TABLE "public"."bf_team_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."bf_versions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "well_id" "uuid",
    "version_number" integer NOT NULL,
    "commit_message" "text",
    "data_snapshot" "jsonb" NOT NULL,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."bf_versions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."bf_wells" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid",
    "user_id" "uuid",
    "name" "text" NOT NULL,
    "location_coords" "point",
    "surface_elevation" numeric,
    "water_depth" numeric,
    "stratigraphy" "jsonb",
    "thermal_history" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "status" "text" DEFAULT 'not-started'::"text",
    "calibration_data" "jsonb" DEFAULT '{}'::"jsonb",
    "scenarios" "jsonb" DEFAULT '[]'::"jsonb",
    "heat_flow" "jsonb" DEFAULT '{}'::"jsonb"
);


ALTER TABLE "public"."bf_wells" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."bhas" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "well_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "bha_name" "text" NOT NULL,
    "components" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."bhas" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."billing_reports" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "report_type" "text" NOT NULL,
    "period_start" "date" NOT NULL,
    "period_end" "date" NOT NULL,
    "generated_at" timestamp with time zone DEFAULT "now"(),
    "data" "jsonb" NOT NULL,
    "file_url" "text"
);


ALTER TABLE "public"."billing_reports" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."branding_audit_log" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid",
    "action" "text" NOT NULL,
    "changes" "jsonb",
    "performed_by" "uuid",
    "timestamp" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."branding_audit_log" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."branding_presets" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid",
    "name" "text" NOT NULL,
    "description" "text",
    "branding_config" "jsonb" NOT NULL,
    "is_active" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid"
);


ALTER TABLE "public"."branding_presets" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."branding_templates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "branding_config" "jsonb" NOT NULL,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."branding_templates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."bulk_import_jobs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "file_url" "text",
    "total_rows" integer,
    "processed_rows" integer DEFAULT 0,
    "failed_rows" integer DEFAULT 0,
    "errors" "jsonb" DEFAULT '[]'::"jsonb",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "completed_at" timestamp with time zone
);


ALTER TABLE "public"."bulk_import_jobs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."calc_runs" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "well_id" "uuid" NOT NULL,
    "casing_string_id" "uuid" NOT NULL,
    "case_id" "uuid" NOT NULL,
    "params" "jsonb",
    "results" "jsonb",
    "status" "text",
    "created_by" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."calc_runs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."calibration_data" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "session_id" "uuid",
    "pressure_points" "jsonb",
    "observations" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."calibration_data" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."calibration_results" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "project_id" "uuid",
    "run_id" "uuid",
    "calibration_data" "jsonb",
    "misfit_stats" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."calibration_results" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."casing_schemes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "well_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "scheme_name" "text" NOT NULL,
    "details" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."casing_schemes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."casing_strings" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "well_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "section_top_md_m" numeric NOT NULL,
    "shoe_md_m" numeric NOT NULL,
    "od_in" numeric NOT NULL,
    "weight_lbft" numeric NOT NULL,
    "grade" "text" NOT NULL,
    "connection" "text",
    "design_factor_burst" numeric DEFAULT 1.1 NOT NULL,
    "design_factor_collapse" numeric DEFAULT 1.0 NOT NULL,
    "design_factor_tension" numeric DEFAULT 1.6 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid",
    CONSTRAINT "design_factor_burst_check" CHECK (("design_factor_burst" >= 1.0)),
    CONSTRAINT "design_factor_collapse_check" CHECK (("design_factor_collapse" >= 1.0)),
    CONSTRAINT "design_factor_tension_check" CHECK (("design_factor_tension" >= 1.0)),
    CONSTRAINT "shoe_md_m_check" CHECK (("shoe_md_m" >= "section_top_md_m"))
);


ALTER TABLE "public"."casing_strings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."cement_jobs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "casing_scheme_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "job_name" "text" NOT NULL,
    "slurry_design" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."cement_jobs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."cementing_simulation_projects" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "project_name" "text" NOT NULL,
    "inputs_data" "jsonb",
    "results_data" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."cementing_simulation_projects" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."completion_plans" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "well_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "plan_name" "text" NOT NULL,
    "vault_id" "uuid",
    "lateral_length_ft" numeric,
    "stages" integer,
    "spacing_ft" numeric,
    "clusters_per_stage" integer,
    "pump_rate_bpm" numeric,
    "fluid_system" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."completion_plans" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."compliance_audits" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid",
    "framework_id" "uuid",
    "auditor_id" "uuid",
    "audit_date" "date",
    "score" numeric,
    "status" "text",
    "report_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."compliance_audits" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."compliance_frameworks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid",
    "name" "text" NOT NULL,
    "description" "text",
    "version" "text",
    "is_active" boolean DEFAULT true
);


ALTER TABLE "public"."compliance_frameworks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."compliance_requirements" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "framework_id" "uuid",
    "section_ref" "text",
    "description" "text" NOT NULL,
    "mandatory" boolean DEFAULT true,
    "status" "text" DEFAULT 'not_started'::"text"
);


ALTER TABLE "public"."compliance_requirements" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."compliance_rules" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "severity" "text",
    "frequency" "text",
    "assigned_department_ids" "uuid"[],
    "responsible_person_id" "uuid",
    "due_date" "date",
    "status" "text" DEFAULT 'Active'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "compliance_rules_severity_check" CHECK (("severity" = ANY (ARRAY['Critical'::"text", 'High'::"text", 'Medium'::"text", 'Low'::"text"])))
);


ALTER TABLE "public"."compliance_rules" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."connectors" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "type" "text" NOT NULL,
    "config" "jsonb" DEFAULT '{}'::"jsonb",
    "status" "text" DEFAULT 'disconnected'::"text",
    "last_connected" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."connectors" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."contour_projects" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "project_name" "text" NOT NULL,
    "map_name" "text",
    "map_image_url" "text",
    "geo_points" "jsonb",
    "fault_lines" "jsonb",
    "gridding_method" "text",
    "grid_cell_size" integer,
    "coordinate_system" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "block_size" integer DEFAULT 11,
    "c_value" integer DEFAULT 2,
    "min_contour_area" integer DEFAULT 100,
    "contours" "jsonb"
);


ALTER TABLE "public"."contour_projects" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."custom_fields" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid",
    "resource_type" "text" NOT NULL,
    "field_name" "text" NOT NULL,
    "field_type" "text" NOT NULL,
    "field_label" "text" NOT NULL,
    "is_required" boolean DEFAULT false,
    "options" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."custom_fields" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."custom_workflows" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid",
    "name" "text" NOT NULL,
    "trigger_event" "text" NOT NULL,
    "actions" "jsonb" NOT NULL,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."custom_workflows" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."data_quality_metrics" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid",
    "overall_score" numeric,
    "completeness_score" numeric,
    "consistency_score" numeric,
    "freshness_score" numeric,
    "issues_found" "jsonb",
    "checked_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."data_quality_metrics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."data_uploads" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "filename" "text" NOT NULL,
    "row_count" integer DEFAULT 0,
    "status" "text" NOT NULL,
    "upload_date" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."data_uploads" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."demo_requests" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "full_name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "company_name" "text" NOT NULL,
    "message" "text",
    "status" "text" DEFAULT 'pending'::"text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."demo_requests" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."departments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "manager_id" "uuid",
    "cost_center" "text",
    "budget" numeric,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "is_active" boolean DEFAULT true
);


ALTER TABLE "public"."departments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."discount_codes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "code" "text" NOT NULL,
    "discount_type" "text" NOT NULL,
    "discount_value" numeric NOT NULL,
    "expiry_date" timestamp with time zone,
    "usage_limit" integer,
    "used_count" integer DEFAULT 0,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "discount_codes_discount_type_check" CHECK (("discount_type" = ANY (ARRAY['percentage'::"text", 'fixed'::"text"])))
);


ALTER TABLE "public"."discount_codes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."doc_activity_log" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "document_id" "uuid",
    "user_id" "uuid",
    "action" "text" NOT NULL,
    "details" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."doc_activity_log" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."doc_categories" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "org_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "code" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."doc_categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."doc_comments" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "document_id" "uuid",
    "revision_id" "uuid",
    "user_id" "uuid" NOT NULL,
    "content" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."doc_comments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."doc_distribution" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "document_id" "uuid",
    "user_id" "uuid",
    "department" "text",
    "distributed_at" timestamp with time zone DEFAULT "now"(),
    "acknowledged_at" timestamp with time zone
);


ALTER TABLE "public"."doc_distribution" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."doc_revisions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "document_id" "uuid",
    "revision_number" "text" NOT NULL,
    "changes_description" "text",
    "file_url" "text",
    "file_name" "text",
    "file_size" bigint,
    "status" "text" DEFAULT 'Draft'::"text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "approved_at" timestamp with time zone
);


ALTER TABLE "public"."doc_revisions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."doc_workflows" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "revision_id" "uuid",
    "reviewer_id" "uuid" NOT NULL,
    "role" "text" NOT NULL,
    "status" "text" DEFAULT 'Pending'::"text",
    "comments" "text",
    "due_date" "date",
    "completed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."doc_workflows" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."documents" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "org_id" "uuid" NOT NULL,
    "document_number" "text" NOT NULL,
    "title" "text" NOT NULL,
    "category_id" "uuid",
    "department" "text",
    "owner_id" "uuid",
    "status" "text" DEFAULT 'Draft'::"text",
    "confidentiality" "text" DEFAULT 'Internal'::"text",
    "current_revision" "text" DEFAULT '01'::"text",
    "project_id" "uuid",
    "asset_id" "uuid",
    "issue_date" "date",
    "next_review_date" "date",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."documents" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."drilling_incidents" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "incident_type" "text",
    "country" "text",
    "region" "text",
    "well_name" "text",
    "incident_date" "date",
    "min_depth_ft" integer,
    "max_depth_ft" integer,
    "mud_weight_ppg" numeric,
    "rop_ft_hr" numeric,
    "summary" "text" NOT NULL,
    "source_url" "text",
    "lat" double precision,
    "lon" double precision,
    "embedding" "public"."vector"(384),
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."drilling_incidents" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."econ_afe_budgets" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "model_id" "uuid" NOT NULL,
    "scenario_id" "uuid",
    "year" integer NOT NULL,
    "category" "text" NOT NULL,
    "amount" numeric NOT NULL,
    "status" "text" DEFAULT 'draft'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid"
);


ALTER TABLE "public"."econ_afe_budgets" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."econ_audit_log" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid",
    "user_id" "uuid",
    "action" "text" NOT NULL,
    "entity_type" "text",
    "entity_id" "uuid",
    "changes" "jsonb",
    "timestamp" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."econ_audit_log" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."econ_audit_logs" AS
 SELECT "id",
    "org_id",
    "user_id",
    "action",
    "entity_type",
    "entity_id",
    "changes",
    "timestamp"
   FROM "public"."econ_audit_log";


ALTER VIEW "public"."econ_audit_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."econ_fdp_snapshots" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "model_id" "uuid" NOT NULL,
    "scenario_id" "uuid",
    "snapshot_data" "jsonb" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid"
);


ALTER TABLE "public"."econ_fdp_snapshots" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."econ_fiscal_terms" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "scenario_id" "uuid",
    "fiscal_regime" "text",
    "terms_json" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."econ_fiscal_terms" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."econ_imports" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "model_id" "uuid" NOT NULL,
    "file_name" "text" NOT NULL,
    "import_type" "text" NOT NULL,
    "data_json" "jsonb" NOT NULL,
    "imported_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."econ_imports" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."econ_inputs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "scenario_id" "uuid",
    "input_key" "text" NOT NULL,
    "input_value" numeric,
    "input_json" "jsonb",
    "unit" "text" DEFAULT ''::"text",
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."econ_inputs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."econ_line_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "scenario_id" "uuid",
    "line_item_type" "text",
    "name" "text" NOT NULL,
    "description" "text",
    "values_by_year" "jsonb" DEFAULT '{}'::"jsonb",
    "unit" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "econ_line_items_line_item_type_check" CHECK (("line_item_type" = ANY (ARRAY['capex'::"text", 'opex'::"text", 'revenue'::"text", 'other'::"text"])))
);


ALTER TABLE "public"."econ_line_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."econ_metrics" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "scenario_id" "uuid" NOT NULL,
    "npv" numeric DEFAULT 0,
    "irr" numeric DEFAULT 0,
    "dpi" numeric DEFAULT 0,
    "payback_year" numeric DEFAULT 0,
    "breakeven_price" numeric DEFAULT 0,
    "unit_technical_cost" numeric DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."econ_metrics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."econ_models" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid",
    "name" "text" NOT NULL,
    "description" "text",
    "model_type" "text",
    "status" "text" DEFAULT 'draft'::"text",
    "base_year" integer DEFAULT (EXTRACT(year FROM CURRENT_DATE))::integer,
    "forecast_years" integer DEFAULT 20,
    "currency" "text" DEFAULT 'USD'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    "last_modified_by" "uuid",
    "updated_by" "uuid",
    CONSTRAINT "econ_models_model_type_check" CHECK (("model_type" = ANY (ARRAY['field_development'::"text", 'exploration'::"text", 'acquisition'::"text", 'divestment'::"text"]))),
    CONSTRAINT "econ_models_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'in_review'::"text", 'approved'::"text", 'archived'::"text"])))
);


ALTER TABLE "public"."econ_models" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."econ_models_v2" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "model_type" "text" NOT NULL,
    "status" "text" NOT NULL,
    "base_year" integer,
    "forecast_years" integer DEFAULT 20,
    "currency" "text" DEFAULT 'USD'::"text",
    "created_by" "uuid",
    "updated_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "econ_models_v2_model_type_check" CHECK (("model_type" = ANY (ARRAY['deterministic'::"text", 'probabilistic'::"text", 'sensitivity'::"text"]))),
    CONSTRAINT "econ_models_v2_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'inactive'::"text", 'archived'::"text"])))
);


ALTER TABLE "public"."econ_models_v2" OWNER TO "postgres";


COMMENT ON TABLE "public"."econ_models_v2" IS 'Petroleum Economics Models (Version 2)';



CREATE TABLE IF NOT EXISTS "public"."econ_projects" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid",
    "name" "text" NOT NULL,
    "description" "text",
    "status" "text" DEFAULT 'draft'::"text",
    "location" "text",
    "operator" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    "currency" "text" DEFAULT 'USD'::"text" NOT NULL,
    "fiscal_year_start" integer DEFAULT 1 NOT NULL,
    "project_type" "text" DEFAULT 'evaluation'::"text",
    "country" "text",
    "settings" "jsonb" DEFAULT '{}'::"jsonb",
    "updated_by" "uuid",
    CONSTRAINT "econ_projects_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'archived'::"text", 'draft'::"text"])))
);


ALTER TABLE "public"."econ_projects" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."econ_results" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "scenario_id" "uuid",
    "metric_name" "text" NOT NULL,
    "metric_value" numeric,
    "unit" "text",
    "computed_at" timestamp with time zone DEFAULT "now"(),
    "computation_version" "text" DEFAULT 'v1.0'::"text"
);


ALTER TABLE "public"."econ_results" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."econ_scenario_notes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "scenario_id" "uuid" NOT NULL,
    "section_key" "text" NOT NULL,
    "notes_text" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid"
);


ALTER TABLE "public"."econ_scenario_notes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."econ_scenarios" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "model_id" "uuid",
    "name" "text" NOT NULL,
    "description" "text",
    "scenario_type" "text" DEFAULT 'deterministic'::"text",
    "is_base_scenario" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    CONSTRAINT "econ_scenarios_scenario_type_check" CHECK (("scenario_type" = ANY (ARRAY['base_case'::"text", 'upside'::"text", 'downside'::"text", 'sensitivity'::"text"])))
);


ALTER TABLE "public"."econ_scenarios" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."econ_scenarios_v2" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "model_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "scenario_type" "text" DEFAULT 'base'::"text",
    "is_base_scenario" boolean DEFAULT false,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "is_locked" boolean DEFAULT false,
    "status" "text" DEFAULT 'draft'::"text"
);


ALTER TABLE "public"."econ_scenarios_v2" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."econ_sensitivity_results" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "scenario_id" "uuid" NOT NULL,
    "parameter_name" "text" NOT NULL,
    "base_value" numeric,
    "low_value" numeric,
    "high_value" numeric,
    "low_result_npv" numeric,
    "high_result_npv" numeric,
    "low_result_irr" numeric,
    "high_result_irr" numeric,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."econ_sensitivity_results" OWNER TO "postgres";


COMMENT ON TABLE "public"."econ_sensitivity_results" IS 'Stored results from tornado/sensitivity analysis';



CREATE TABLE IF NOT EXISTS "public"."econ_timegrid" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "model_id" "uuid",
    "year" integer NOT NULL,
    "month" integer,
    "period_name" "text",
    "is_active" boolean DEFAULT true,
    "sequence_order" integer
);


ALTER TABLE "public"."econ_timegrid" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."em_fault_sticks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "fault_id" "uuid" NOT NULL,
    "x" numeric NOT NULL,
    "y" numeric NOT NULL,
    "z" numeric NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."em_fault_sticks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."em_faults" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "throw" numeric,
    "type" "text",
    "storage_key" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."em_faults" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."em_grid_properties" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "grid_id" "uuid" NOT NULL,
    "property_name" "text" NOT NULL,
    "zone" "text",
    "storage_key" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."em_grid_properties" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."em_grids" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "nx" integer NOT NULL,
    "ny" integer NOT NULL,
    "nz" integer NOT NULL,
    "status" "text" DEFAULT 'draft'::"text",
    "storage_key" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."em_grids" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."em_jobs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid",
    "type" "text" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text",
    "parameters" "jsonb",
    "results" "jsonb",
    "logs" "text"[],
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."em_jobs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."em_object_templates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "type" "text" NOT NULL,
    "template_data" "jsonb" NOT NULL,
    "is_public" boolean DEFAULT false,
    "user_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."em_object_templates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."em_objects" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid",
    "name" "text" NOT NULL,
    "type" "text" NOT NULL,
    "geometry_data" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "properties" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "placement_data" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "user_id" "uuid",
    CONSTRAINT "em_objects_type_check" CHECK (("type" = ANY (ARRAY['channel'::"text", 'lobe'::"text", 'salt'::"text", 'fault_block'::"text", 'complex'::"text"])))
);


ALTER TABLE "public"."em_objects" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."em_petro_analyses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid",
    "name" "text" NOT NULL,
    "type" "text" NOT NULL,
    "input_data" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "results" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "status" "text" DEFAULT 'draft'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "user_id" "uuid"
);


ALTER TABLE "public"."em_petro_analyses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."em_petro_templates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "property_type" "text" NOT NULL,
    "model_params" "jsonb" NOT NULL,
    "user_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."em_petro_templates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."em_projects" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "crs" "text" DEFAULT 'EPSG:4326'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."em_projects" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."em_surface_points" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "surface_id" "uuid" NOT NULL,
    "x" numeric NOT NULL,
    "y" numeric NOT NULL,
    "z" numeric NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."em_surface_points" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."em_surfaces" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "type" "text" NOT NULL,
    "version" integer DEFAULT 1,
    "status" "text" DEFAULT 'active'::"text",
    "storage_key" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."em_surfaces" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."em_volumes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid" NOT NULL,
    "grid_id" "uuid",
    "zone" "text",
    "case_name" "text",
    "grv" numeric,
    "nrv" numeric,
    "pv" numeric,
    "hc_volume" numeric,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."em_volumes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."em_well_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "well_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "depth" numeric[] NOT NULL,
    "facies" numeric[],
    "phi" numeric[],
    "sw" numeric[],
    "k" numeric[],
    "vsh" numeric[],
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."em_well_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."em_wells" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "x" numeric,
    "y" numeric,
    "z_surface" numeric,
    "z_datum" numeric,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "user_id" "uuid"
);


ALTER TABLE "public"."em_wells" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."email_templates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "subject" "text" NOT NULL,
    "body_html" "text" NOT NULL,
    "variables" "text"[],
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."email_templates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."employee_app_access" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "member_id" "uuid" NOT NULL,
    "app_id" "text" NOT NULL,
    "access_level" "text" DEFAULT 'standard'::"text",
    "granted_at" timestamp with time zone DEFAULT "now"(),
    "granted_by" "uuid"
);


ALTER TABLE "public"."employee_app_access" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."employee_storage" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "member_id" "uuid" NOT NULL,
    "storage_used_gb" numeric(10,2) DEFAULT 0.00,
    "last_updated" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."employee_storage" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."enterprise_quotes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "organization_name" "text",
    "quote_details" "jsonb" NOT NULL,
    "total_amount" numeric NOT NULL,
    "created_by" "uuid",
    "pdf_url" "text",
    "breakdown" "jsonb",
    "contact_email" "text"
);


ALTER TABLE "public"."enterprise_quotes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."environment_emp_actions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid" NOT NULL,
    "study_id" "uuid",
    "action_description" "text" NOT NULL,
    "mitigation_measure" "text",
    "responsible_person" "text",
    "due_date" "date",
    "status" "text" DEFAULT 'Open'::"text",
    "completion_date" "date",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."environment_emp_actions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."environment_facilities" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "type" "text",
    "location" "text",
    "coordinates" "jsonb",
    "status" "text" DEFAULT 'Active'::"text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."environment_facilities" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."environment_flaring_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid" NOT NULL,
    "facility_id" "uuid",
    "log_date" "date" NOT NULL,
    "volume_m3" numeric NOT NULL,
    "duration_hours" numeric,
    "reason" "text",
    "methane_emissions_tonnes" numeric,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."environment_flaring_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."environment_metrics" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid",
    "metric_type" "text" NOT NULL,
    "value" numeric,
    "unit" "text",
    "location" "text",
    "recorded_at" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."environment_metrics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."environment_monitoring_results" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid" NOT NULL,
    "facility_id" "uuid",
    "parameter" "text" NOT NULL,
    "value" numeric NOT NULL,
    "unit" "text" NOT NULL,
    "sample_date" timestamp with time zone NOT NULL,
    "location_point" "text",
    "limit_value" numeric,
    "status" "text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."environment_monitoring_results" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."environment_obligations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid" NOT NULL,
    "facility_id" "uuid",
    "description" "text" NOT NULL,
    "applicable_law" "text",
    "effective_date" "date",
    "status" "text" DEFAULT 'Active'::"text",
    "compliance_status" "text" DEFAULT 'Compliant'::"text",
    "evidence_required" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."environment_obligations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."environment_permits" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid" NOT NULL,
    "facility_id" "uuid",
    "permit_number" "text" NOT NULL,
    "type" "text" NOT NULL,
    "issuing_authority" "text",
    "issue_date" "date",
    "expiry_date" "date",
    "status" "text" DEFAULT 'Active'::"text",
    "renewal_due_date" "date" GENERATED ALWAYS AS (("expiry_date" - '90 days'::interval)) STORED,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."environment_permits" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."environment_spill_reports" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid" NOT NULL,
    "spill_id" "text" NOT NULL,
    "incident_date" timestamp with time zone NOT NULL,
    "substance" "text",
    "quantity_spilled" numeric,
    "quantity_recovered" numeric,
    "unit" "text",
    "severity" "text",
    "status" "text" DEFAULT 'Open'::"text",
    "location_text" "text",
    "coordinates" "jsonb",
    "remediation_plan" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."environment_spill_reports" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."environment_studies" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid" NOT NULL,
    "facility_id" "uuid",
    "title" "text" NOT NULL,
    "type" "text" NOT NULL,
    "cycle_years" integer DEFAULT 5,
    "last_conducted_date" "date",
    "next_due_date" "date",
    "status" "text" DEFAULT 'Valid'::"text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."environment_studies" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."environment_waste_manifests" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid" NOT NULL,
    "manifest_number" "text" NOT NULL,
    "waste_type" "text" NOT NULL,
    "quantity" numeric NOT NULL,
    "unit" "text" DEFAULT 'tonnes'::"text",
    "classification" "text",
    "transporter" "text",
    "disposal_facility" "text",
    "disposal_date" "date",
    "status" "text" DEFAULT 'Generated'::"text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."environment_waste_manifests" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."environmental_monitoring" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "site_id" "uuid",
    "metric_type" "text" NOT NULL,
    "value" numeric NOT NULL,
    "unit" "text" NOT NULL,
    "location_detail" "text",
    "reading_time" timestamp with time zone DEFAULT "now"(),
    "device_id" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."environmental_monitoring" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."epe_capex" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "case_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "data" "jsonb",
    "file_name" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."epe_capex" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."epe_cases" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "case_name" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."epe_cases" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."epe_opex" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "case_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "data" "jsonb",
    "file_name" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."epe_opex" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."epe_production_volumes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "case_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "data" "jsonb",
    "file_name" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."epe_production_volumes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."epe_results" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "run_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "kpis" "jsonb",
    "cash_flow_data" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."epe_results" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."epe_run_configs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "case_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "config_name" "text" NOT NULL,
    "description" "text",
    "oil_price_usd_bbl" numeric DEFAULT 75.00 NOT NULL,
    "gas_price_usd_mscf" numeric DEFAULT 4.50 NOT NULL,
    "condensate_price_usd_bbl" numeric DEFAULT 70.00 NOT NULL,
    "discount_rate_pct" numeric DEFAULT 10.00 NOT NULL,
    "inflation_rate_pct" numeric DEFAULT 3.00 NOT NULL,
    "base_year" integer DEFAULT 2027 NOT NULL,
    "fiscal_regime" "text" DEFAULT 'JV'::"text" NOT NULL,
    "jv_working_interest_pct" numeric DEFAULT 100.00,
    "jv_royalty_pct" numeric DEFAULT 10.00,
    "jv_tax_rate_pct" numeric DEFAULT 50.00,
    "psc_royalty_pct" numeric DEFAULT 10.00,
    "psc_cost_oil_cap_pct" numeric DEFAULT 80.00,
    "psc_contractor_profit_share_pct" numeric DEFAULT 50.00,
    "psc_tax_rate_pct" numeric DEFAULT 50.00,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "oil_price_escalator_pct" numeric,
    "gas_price_escalator_pct" numeric,
    "condensate_price_escalator_pct" numeric,
    "opex_escalator_pct" numeric,
    "capex_escalator_pct" numeric DEFAULT 0 NOT NULL,
    "present_value_basis" "text" DEFAULT 'real'::"text" NOT NULL,
    "pia_terrain" "text",
    "pia_license_type" "text",
    "pia_lease_status" "text",
    "pia_water_depth_m" numeric,
    "pia_marginal_field_pre_2021" boolean DEFAULT false,
    "pia_hct_rate_override_pct" numeric,
    "pia_cit_rate_pct" numeric DEFAULT 30,
    "pia_tet_rate_pct" numeric DEFAULT 2.5,
    "pia_nddc_levy_pct_of_opex" numeric DEFAULT 3,
    "pia_nddc_levy_fixed_usd" numeric,
    "pia_prior_year_opex_usd" numeric,
    "pia_capex_recovery_years" integer DEFAULT 5,
    "pia_cpr_limit_pct" numeric DEFAULT 65,
    "pia_production_allowance_per_bbl_converted" numeric DEFAULT 2.50,
    "pia_production_allowance_per_bbl_new" numeric DEFAULT 8.00,
    "pia_production_allowance_pct_of_price" numeric DEFAULT 20,
    "pia_under_nta_2025_override" "text" DEFAULT 'auto'::"text" NOT NULL,
    "pia_deep_offshore_hct_interpretation" "text" DEFAULT 'conservative_zero'::"text" NOT NULL,
    "pia_deep_offshore_hct_custom_rate_pct" numeric,
    "pia_development_levy_rate_pct" numeric DEFAULT 4.0 NOT NULL,
    "pia_apply_minimum_etr" boolean DEFAULT false NOT NULL,
    "pia_minimum_etr_pct" numeric DEFAULT 15.0 NOT NULL,
    "pia_new_lease_prod_alw_cap_onshore_bbl" numeric DEFAULT 50000000 NOT NULL,
    "pia_new_lease_prod_alw_cap_shallow_bbl" numeric DEFAULT 100000000 NOT NULL,
    "pia_new_lease_prod_alw_cap_deep_bbl" numeric DEFAULT 500000000 NOT NULL,
    "pia_prior_cumulative_oil_bbl" numeric DEFAULT 0 NOT NULL,
    CONSTRAINT "epe_run_configs_fiscal_regime_check" CHECK (("fiscal_regime" = ANY (ARRAY['JV'::"text", 'PSC'::"text", 'PIA'::"text"]))),
    CONSTRAINT "epe_run_configs_pia_deep_offshore_hct_interpretation_check" CHECK (("pia_deep_offshore_hct_interpretation" = ANY (ARRAY['conservative_zero'::"text", 'aggressive_pml_30'::"text", 'custom'::"text"]))),
    CONSTRAINT "epe_run_configs_pia_lease_status_check" CHECK ((("pia_lease_status" IS NULL) OR ("pia_lease_status" = ANY (ARRAY['converted'::"text", 'new'::"text"])))),
    CONSTRAINT "epe_run_configs_pia_license_type_check" CHECK ((("pia_license_type" IS NULL) OR ("pia_license_type" = ANY (ARRAY['PML'::"text", 'PPL'::"text"])))),
    CONSTRAINT "epe_run_configs_pia_terrain_check" CHECK ((("pia_terrain" IS NULL) OR ("pia_terrain" = ANY (ARRAY['onshore'::"text", 'shallow_water'::"text", 'deep_offshore'::"text", 'frontier'::"text", 'marginal_field'::"text"])))),
    CONSTRAINT "epe_run_configs_pia_under_nta_2025_override_check" CHECK (("pia_under_nta_2025_override" = ANY (ARRAY['auto'::"text", 'force_pia'::"text", 'force_nta'::"text"]))),
    CONSTRAINT "epe_run_configs_present_value_basis_check" CHECK (("present_value_basis" = ANY (ARRAY['real'::"text", 'nominal'::"text"])))
);


ALTER TABLE "public"."epe_run_configs" OWNER TO "postgres";


COMMENT ON COLUMN "public"."epe_run_configs"."pia_under_nta_2025_override" IS 'Controls which fiscal framework is applied to PIA-regime runs. ''auto'' uses date trigger (NTA if base_year >= 2026, else PIA-only). ''force_pia'' applies PIA-only rules regardless of year. ''force_nta'' applies NTA 2025 rules regardless of year. Per design Q2(c).';



COMMENT ON COLUMN "public"."epe_run_configs"."pia_deep_offshore_hct_interpretation" IS 'Per Olaniwun Ajayi (Oct 2025) and Fortrose Energy Brief (Jan 2026): NTA 2025 removes the deep offshore HCT exemption but specifies no rate. Three interpretations are offered. Only operative when terrain=deep_offshore and framework=nta_2025. Per design Q1 / Option D3.';



COMMENT ON COLUMN "public"."epe_run_configs"."pia_deep_offshore_hct_custom_rate_pct" IS 'Custom HCT rate percentage for deep offshore. Used only when pia_deep_offshore_hct_interpretation = ''custom''. NULL otherwise.';



COMMENT ON COLUMN "public"."epe_run_configs"."pia_development_levy_rate_pct" IS 'NTA 2025 Section 59 Development Levy rate. Replaces TET 2.5% when framework = nta_2025. Default 4.0%. Levy consolidates TET + NITDA + NASENI + Police Trust Fund. Applied to assessable profit (same base as TET was).';



COMMENT ON COLUMN "public"."epe_run_configs"."pia_apply_minimum_etr" IS 'NTA Section 57: applies a 15% effective tax rate floor for MNE groups (turnover >= EUR750m) or Nigerian companies with turnover >= NGN50bn. Rarely binds for petroleum operators (HCT + CIT typically > 30% combined). Default false. Operator opts in.';



COMMENT ON COLUMN "public"."epe_run_configs"."pia_minimum_etr_pct" IS 'Minimum effective tax rate percentage. NTA default is 15%. Only operative when pia_apply_minimum_etr = true.';



COMMENT ON COLUMN "public"."epe_run_configs"."pia_new_lease_prod_alw_cap_onshore_bbl" IS 'PIA Sixth Schedule: cumulative oil production cap (bbl) for production allowance on NEW onshore leases. Default 50,000,000 bbl. Beyond this cumulative, no production allowance applies. Operative only when pia_lease_status = ''new''.';



COMMENT ON COLUMN "public"."epe_run_configs"."pia_new_lease_prod_alw_cap_shallow_bbl" IS 'PIA Sixth Schedule: cumulative oil production cap (bbl) for production allowance on NEW shallow water leases. Default 100,000,000 bbl.';



COMMENT ON COLUMN "public"."epe_run_configs"."pia_new_lease_prod_alw_cap_deep_bbl" IS 'PIA Sixth Schedule: cumulative oil production cap (bbl) for production allowance on NEW deep offshore leases. Default 500,000,000 bbl.';



COMMENT ON COLUMN "public"."epe_run_configs"."pia_prior_cumulative_oil_bbl" IS 'Cumulative oil bbl already produced under this lease BEFORE the modeled first year. Used as the starting cumulative for production-allowance cap tracking. Default 0 (greenfield).';



CREATE TABLE IF NOT EXISTS "public"."epe_runs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "case_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "run_name" "text" NOT NULL,
    "parameters" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "run_config_id" "uuid"
);


ALTER TABLE "public"."epe_runs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."epe_sensitivity_results" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "sensitivity_run_id" "uuid" NOT NULL,
    "variable" "text" NOT NULL,
    "variable_label" "text",
    "base_value" numeric,
    "low_factor" numeric DEFAULT 0.8 NOT NULL,
    "high_factor" numeric DEFAULT 1.2 NOT NULL,
    "low_value" numeric,
    "high_value" numeric,
    "base_npv" numeric,
    "low_npv" numeric NOT NULL,
    "high_npv" numeric NOT NULL,
    "delta_low_npv" numeric NOT NULL,
    "delta_high_npv" numeric NOT NULL,
    "max_abs_delta" numeric NOT NULL,
    "ordinal" integer,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."epe_sensitivity_results" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."epe_sensitivity_runs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "base_run_id" "uuid" NOT NULL,
    "base_run_config_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "status" "text" DEFAULT 'queued'::"text" NOT NULL,
    "base_npv" numeric,
    "error_message" "text",
    "sweeps_count" integer DEFAULT 0 NOT NULL,
    "duration_ms" integer,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "completed_at" timestamp with time zone,
    CONSTRAINT "epe_sensitivity_runs_status_check" CHECK (("status" = ANY (ARRAY['queued'::"text", 'running'::"text", 'complete'::"text", 'failed'::"text"])))
);


ALTER TABLE "public"."epe_sensitivity_runs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "well_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "event_description" "text" NOT NULL,
    "event_timestamp" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."expert_mode_sessions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "project_id" "uuid",
    "last_active_tab" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."expert_mode_sessions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."expert_mode_settings" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "project_id" "uuid",
    "settings" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."expert_mode_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."facility_layouts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "project_name" "text" NOT NULL,
    "layout_data" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."facility_layouts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."fdp_facilities" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "fdp_project_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "capex_mm_usd" numeric,
    "opex_mm_usd_yr" numeric,
    "description" "text"
);


ALTER TABLE "public"."fdp_facilities" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."fdp_price_decks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "fdp_project_id" "uuid" NOT NULL,
    "year" integer NOT NULL,
    "oil_price_usd" numeric,
    "gas_price_usd" numeric
);


ALTER TABLE "public"."fdp_price_decks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."fdp_projects" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "project_name" "text" NOT NULL,
    "location" "text",
    "partners" "text"[],
    "start_date" "date",
    "end_date" "date",
    "p50_reserves_mmbo" numeric,
    "recovery_method" "text",
    "fluid_properties" "jsonb",
    "fiscal_terms" "jsonb",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"())
);


ALTER TABLE "public"."fdp_projects" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."fdp_wells" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "fdp_project_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "type" "text",
    "count" integer,
    "drilling_cost_mm_usd" numeric,
    "completion_cost_mm_usd" numeric
);


ALTER TABLE "public"."fdp_wells" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."feature_flags" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "key" "text" NOT NULL,
    "is_enabled" boolean DEFAULT false,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."feature_flags" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."feedback" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid",
    "user_id" "uuid",
    "target_type" "text",
    "target_id" "uuid",
    "rating" integer,
    "feedback_category" "text",
    "comment" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "feedback_rating_check" CHECK ((("rating" >= 1) AND ("rating" <= 5)))
);


ALTER TABLE "public"."feedback" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."fire_drills" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid" NOT NULL,
    "drill_date" "date" NOT NULL,
    "drill_type" "text" NOT NULL,
    "location" "text",
    "evacuation_time_minutes" numeric,
    "participants_count" integer,
    "scenario_description" "text",
    "lessons_learned" "text",
    "status" "text" DEFAULT 'Planned'::"text",
    "report_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."fire_drills" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."fire_emergency_response_plans" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "version" "text",
    "document_url" "text",
    "effective_date" "date",
    "review_date" "date",
    "status" "text" DEFAULT 'Active'::"text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."fire_emergency_response_plans" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."fire_equipment_inventory" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid" NOT NULL,
    "equipment_type" "text" NOT NULL,
    "serial_number" "text",
    "location" "text" NOT NULL,
    "status" "text" DEFAULT 'Operational'::"text",
    "last_inspection_date" "date",
    "next_inspection_date" "date",
    "pressure_reading" "text",
    "expiry_date" "date",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."fire_equipment_inventory" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."fire_equipment_maintenance" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "inventory_id" "uuid",
    "org_id" "uuid" NOT NULL,
    "maintenance_date" "date" NOT NULL,
    "performed_by" "text",
    "type" "text",
    "findings" "text",
    "action_taken" "text",
    "status" "text" DEFAULT 'Completed'::"text",
    "next_due_date" "date",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."fire_equipment_maintenance" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."fire_incident_investigation" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "incident_id" "uuid",
    "org_id" "uuid" NOT NULL,
    "root_cause" "text",
    "contributing_factors" "text",
    "corrective_actions" "text",
    "preventive_measures" "text",
    "investigator_id" "uuid",
    "status" "text" DEFAULT 'In Progress'::"text",
    "completed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."fire_incident_investigation" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."fire_incidents" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid" NOT NULL,
    "incident_date" timestamp with time zone NOT NULL,
    "location" "text" NOT NULL,
    "fire_type" "text",
    "cause" "text",
    "damage_extent" "text",
    "injuries_count" integer DEFAULT 0,
    "fatalities_count" integer DEFAULT 0,
    "response_actions" "text",
    "status" "text" DEFAULT 'Open'::"text",
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid"
);


ALTER TABLE "public"."fire_incidents" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."fire_safety_compliance" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid" NOT NULL,
    "checklist_item" "text" NOT NULL,
    "standard_ref" "text",
    "is_compliant" boolean DEFAULT false,
    "last_checked_date" "date",
    "evidence_url" "text",
    "remarks" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."fire_safety_compliance" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."fire_safety_risks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid" NOT NULL,
    "facility_id" "uuid",
    "hazard_id" "text" NOT NULL,
    "description" "text" NOT NULL,
    "location" "text",
    "likelihood" integer,
    "consequence" integer,
    "risk_score" integer GENERATED ALWAYS AS (("likelihood" * "consequence")) STORED,
    "mitigation_measures" "text",
    "monitoring_status" "text" DEFAULT 'Active'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    CONSTRAINT "fire_safety_risks_consequence_check" CHECK ((("consequence" >= 1) AND ("consequence" <= 5))),
    CONSTRAINT "fire_safety_risks_likelihood_check" CHECK ((("likelihood" >= 1) AND ("likelihood" <= 5)))
);


ALTER TABLE "public"."fire_safety_risks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."fiscal_regime_projects" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "project_name" "text" NOT NULL,
    "project_inputs" "jsonb" NOT NULL,
    "regimes_data" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."fiscal_regime_projects" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."fitness_activities" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "activity_date" "date" NOT NULL,
    "steps" integer DEFAULT 0,
    "activity_type" "text",
    "duration_minutes" integer,
    "calories_burned" integer,
    "notes" "text",
    "source" "text" DEFAULT 'Manual Entry'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."fitness_activities" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."fitness_goals" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "daily_step_goal" integer DEFAULT 8000,
    "weekly_step_goal" integer DEFAULT 56000,
    "monthly_step_goal" integer DEFAULT 240000,
    "goal_start_date" "date" DEFAULT CURRENT_DATE,
    "goal_end_date" "date",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."fitness_goals" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."flow_assurance_projects" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "project_name" "text" NOT NULL,
    "inputs_data" "jsonb",
    "results_data" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."flow_assurance_projects" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."fluid_studio_projects" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "reservoir_id" "uuid",
    "project_name" "text" NOT NULL,
    "inputs" "jsonb" NOT NULL,
    "results" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."fluid_studio_projects" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."frac_completion_projects" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "project_name" "text" NOT NULL,
    "inputs_data" "jsonb",
    "results_data" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."frac_completion_projects" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."frac_vault" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "design_name" "text" NOT NULL,
    "fluid_system" "text",
    "proppant_type" "text",
    "pump_rate_bpm" numeric,
    "stage_spacing_ft" numeric,
    "perf_cluster_count" integer,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."frac_vault" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."geomech_measurements" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "well_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "tvd_m" numeric NOT NULL,
    "mtype" "text",
    "value_num" numeric,
    "unit" "text",
    "remarks" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."geomech_measurements" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."geomech_params" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "well_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "method" "text",
    "nct_vp0_mps" numeric,
    "nct_k" numeric,
    "eaton_exp" numeric,
    "overburden_grad_sg" numeric,
    "poisson" numeric,
    "fg_method" "text",
    "tectonic_coeff" numeric,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."geomech_params" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."geomech_velocity" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "well_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "tvd_m" numeric NOT NULL,
    "vp_mps" numeric,
    "vs_mps" numeric,
    "quality" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."geomech_velocity" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."geomechanics_projects" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "project_name" "text" NOT NULL,
    "inputs_data" "jsonb",
    "results_data" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."geomechanics_projects" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."gm_curves" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "dataset_id" "uuid" NOT NULL,
    "org_id" "uuid" NOT NULL,
    "mnemonic" "text" NOT NULL,
    "unit" "text",
    "sample_step_ft" numeric,
    "stats" "jsonb",
    "qc" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."gm_curves" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."gm_datasets" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "well_id" "uuid" NOT NULL,
    "org_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "source" "public"."dataset_source_type",
    "status" "text",
    "remarks" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."gm_datasets" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."gm_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "well_id" "uuid" NOT NULL,
    "org_id" "uuid" NOT NULL,
    "type" "public"."event_type" NOT NULL,
    "md_ft" numeric NOT NULL,
    "tvd_ft" numeric NOT NULL,
    "value" numeric,
    "unit" "text",
    "comment" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."gm_events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."gm_models" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "well_id" "uuid" NOT NULL,
    "org_id" "uuid" NOT NULL,
    "method" "public"."model_method_type",
    "params" "jsonb",
    "locked" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."gm_models" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."gm_run_points" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "run_id" "uuid" NOT NULL,
    "org_id" "uuid" NOT NULL,
    "tvd_ft" numeric NOT NULL,
    "obg_ppg" numeric,
    "pp_p10_ppg" numeric,
    "pp_p50_ppg" numeric,
    "pp_p90_ppg" numeric,
    "fg_p10_ppg" numeric,
    "fg_p50_ppg" numeric,
    "fg_p90_ppg" numeric,
    "window_ppg" numeric,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."gm_run_points" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."gm_runs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "inputs" "jsonb",
    "summary" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."gm_runs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."gm_wells" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "kb_elev_ft" numeric,
    "water_depth_ft" numeric,
    "srid" integer,
    "md_tvd_ref" "public"."md_tvd_ref_type",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."gm_wells" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."hazard_assessments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "site_id" "uuid",
    "hazard_description" "text" NOT NULL,
    "likelihood" "text",
    "impact" "text",
    "risk_score" integer,
    "location_detail" "text",
    "assessed_by" "uuid",
    "assessment_date" timestamp with time zone DEFAULT "now"(),
    "status" "text" DEFAULT 'active'::"text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."hazard_assessments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."health_metrics" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid",
    "metric_name" "text" NOT NULL,
    "value" numeric,
    "unit" "text",
    "category" "text",
    "recorded_at" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."health_metrics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."health_profiles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "medical_conditions" "text"[],
    "allergies" "text"[],
    "medications" "text"[],
    "emergency_contact" "text",
    "medical_history" "text",
    "fitness_for_duty_status" "text" DEFAULT 'Fit'::"text",
    "fitness_for_duty_date" timestamp with time zone,
    "restrictions_accommodations" "text",
    "health_risk_score" integer DEFAULT 0,
    "last_health_screening_date" timestamp with time zone,
    "next_health_screening_date" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."health_profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."health_screenings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "screening_type" "text" NOT NULL,
    "screening_date" "date",
    "results" "text",
    "recommendations" "text",
    "follow_up_actions" "text"[],
    "next_screening_date" "date",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."health_screenings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."help_articles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "category_id" "uuid",
    "title" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "content" "text" NOT NULL,
    "tags" "text"[],
    "difficulty_level" "text",
    "read_time_minutes" integer,
    "video_url" "text",
    "is_published" boolean DEFAULT true,
    "view_count" integer DEFAULT 0,
    "helpful_count" integer DEFAULT 0,
    "not_helpful_count" integer DEFAULT 0,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "help_articles_difficulty_level_check" CHECK (("difficulty_level" = ANY (ARRAY['Beginner'::"text", 'Intermediate'::"text", 'Advanced'::"text"])))
);


ALTER TABLE "public"."help_articles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."help_categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "icon" "text",
    "display_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."help_categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."help_feedback" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "article_id" "uuid",
    "user_id" "uuid",
    "is_helpful" boolean,
    "comment" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."help_feedback" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."hydraulics_runs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "well_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "inputs" "jsonb",
    "results" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."hydraulics_runs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."incident_attachments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "incident_id" "uuid",
    "file_url" "text" NOT NULL,
    "file_name" "text",
    "file_type" "text",
    "uploaded_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."incident_attachments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."incident_comments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "incident_id" "uuid",
    "user_id" "uuid",
    "comment_text" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."incident_comments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."incidents" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "site_id" "uuid",
    "report_type" "text" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "incident_date" timestamp with time zone,
    "location_detail" "text",
    "severity" "text",
    "hazard_category" "text",
    "immediate_controls" "text",
    "people_involved" "jsonb" DEFAULT '[]'::"jsonb",
    "actions" "jsonb" DEFAULT '[]'::"jsonb",
    "attachments" "jsonb" DEFAULT '[]'::"jsonb",
    "is_anonymous" boolean DEFAULT false,
    "status" "text" DEFAULT 'open'::"text",
    "reference_code" "text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "quick_report" boolean DEFAULT false,
    "image_url" character varying(500),
    "audio_url" character varying(500),
    "ai_confidence_score" numeric(3,2),
    "template_id" character varying(50),
    "transcription" "text",
    "sent_to_supervisor" boolean DEFAULT false,
    "submitted_to_management" boolean DEFAULT false,
    "saved_as_draft" boolean DEFAULT false,
    "root_cause" "text",
    "corrective_actions" "text",
    "preventive_actions" "text",
    "lessons_learned" "text",
    "witnesses" "jsonb" DEFAULT '[]'::"jsonb",
    "injuries_count" integer DEFAULT 0,
    "injured_persons" "jsonb" DEFAULT '[]'::"jsonb",
    "incident_number" "text",
    "acknowledged_at" timestamp with time zone,
    "acknowledged_by" "uuid",
    "closed_at" timestamp with time zone,
    "closed_by" "uuid",
    "equipment_involved" "text",
    "immediate_actions_taken" "text"
);


ALTER TABLE "public"."incidents" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."integration_audit_log" (
    "log_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "action" "text" NOT NULL,
    "app_name" "text",
    "timestamp" timestamp with time zone DEFAULT "now"(),
    "user_id" "uuid",
    "details" "jsonb"
);


ALTER TABLE "public"."integration_audit_log" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."integration_connections" (
    "connection_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "source_app" "text" NOT NULL,
    "target_app" "text" NOT NULL,
    "connection_status" "text" NOT NULL,
    "last_sync" timestamp with time zone,
    "sync_frequency" "text",
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."integration_connections" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."integration_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "emitter_app" "text" NOT NULL,
    "event_type" "text" NOT NULL,
    "payload" "jsonb",
    "user_id" "uuid" NOT NULL
);


ALTER TABLE "public"."integration_events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."integration_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid",
    "source" "text",
    "event" "text",
    "status" "text",
    "details" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."integration_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."integration_snapshots" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "model_id" "uuid",
    "scenario_id" "uuid",
    "target_system" "text" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text",
    "snapshot_data" "jsonb",
    "user_id" "uuid"
);


ALTER TABLE "public"."integration_snapshots" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."integration_sync_history" (
    "sync_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "source_app" "text" NOT NULL,
    "target_app" "text" NOT NULL,
    "sync_type" "text" NOT NULL,
    "sync_status" "text" NOT NULL,
    "sync_timestamp" timestamp with time zone DEFAULT "now"(),
    "data_records" integer DEFAULT 0,
    "errors" "jsonb",
    "user_id" "uuid" NOT NULL
);


ALTER TABLE "public"."integration_sync_history" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."integration_workflows" (
    "workflow_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "workflow_name" "text" NOT NULL,
    "workflow_definition" "jsonb" NOT NULL,
    "workflow_status" "text" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."integration_workflows" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."invitations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid",
    "email" "text" NOT NULL,
    "first_name" "text",
    "last_name" "text",
    "role" "text" NOT NULL,
    "department_id" "uuid",
    "token" "uuid" DEFAULT "gen_random_uuid"(),
    "status" "text" DEFAULT 'pending'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "expires_at" timestamp with time zone DEFAULT ("now"() + '7 days'::interval),
    "accepted_at" timestamp with time zone,
    "invited_by" "uuid",
    "app_context" "text" DEFAULT 'suite'::"text"
);


ALTER TABLE "public"."invitations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."invoices" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "subscription_id" "uuid" NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "amount" numeric NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "due_date" "date" NOT NULL,
    "issued_date" "date" DEFAULT CURRENT_DATE NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "pdf_url" "text",
    "items" "jsonb"
);


ALTER TABLE "public"."invoices" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."key_personnel" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "role" character varying(100),
    "user_id" "uuid" NOT NULL,
    "assigned_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."key_personnel" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."leaderboard_history" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "points_earned" numeric NOT NULL,
    "reason" "text",
    "report_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"()
);

ALTER TABLE ONLY "public"."leaderboard_history" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."leaderboard_history" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."leaderboard_scores" (
    "user_id" "uuid" NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "total_reports" integer DEFAULT 0,
    "total_points" numeric DEFAULT 0,
    "ranking" integer,
    "updated_at" timestamp with time zone DEFAULT "now"()
);

ALTER TABLE ONLY "public"."leaderboard_scores" FORCE ROW LEVEL SECURITY;


ALTER TABLE "public"."leaderboard_scores" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."load_cases" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "casing_string_id" "uuid" NOT NULL,
    "case_name" "text" NOT NULL,
    "case_type" "text" NOT NULL,
    "internal_p_profile" "jsonb",
    "external_p_profile" "jsonb",
    "temp_profile" "jsonb",
    "axial_hookload_lbf" numeric,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "well_id" "uuid",
    "user_id" "uuid"
);


ALTER TABLE "public"."load_cases" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."log_digitizer_projects" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "project_name" "text" NOT NULL,
    "image_path" "text",
    "calibration" "jsonb" DEFAULT '{}'::"jsonb",
    "curves" "jsonb" DEFAULT '[]'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."log_digitizer_projects" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."log_facies_projects" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "project_name" "text" NOT NULL,
    "project_data" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."log_facies_projects" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."lookup_additives" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "additive_name" "text" NOT NULL,
    "purpose" "text",
    "typical_concentration" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."lookup_additives" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."lookup_casing_grades" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "grade_name" "text" NOT NULL,
    "yield_strength_psi" integer,
    "tensile_strength_psi" integer,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."lookup_casing_grades" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."medical_certifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "certificate_type" "text" NOT NULL,
    "issue_date" "date",
    "expiry_date" "date",
    "issuing_authority" "text",
    "certificate_file_url" "text",
    "status" "text" DEFAULT 'Valid'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."medical_certifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."mem_activity_log" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "well_id" "uuid",
    "user_id" "uuid" NOT NULL,
    "action" "text" NOT NULL,
    "details" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."mem_activity_log" OWNER TO "postgres";


COMMENT ON TABLE "public"."mem_activity_log" IS 'Logs user activities for auditing and collaboration history.';



CREATE TABLE IF NOT EXISTS "public"."mem_batch_jobs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "job_name" "text" NOT NULL,
    "status" "text" NOT NULL,
    "well_ids" "uuid"[],
    "total_wells" integer,
    "processed_wells" integer DEFAULT 0,
    "failed_wells" integer DEFAULT 0,
    "template" "text",
    "failure_criteria" "text",
    "results" "jsonb",
    "error_message" "text",
    "progress_percent" integer DEFAULT 0,
    "estimated_completion_time" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "completed_at" timestamp with time zone
);


ALTER TABLE "public"."mem_batch_jobs" OWNER TO "postgres";


COMMENT ON TABLE "public"."mem_batch_jobs" IS 'Manages batch processing jobs for generating multiple MEMs.';



CREATE TABLE IF NOT EXISTS "public"."mem_calculations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid" NOT NULL,
    "job_id" "uuid" NOT NULL,
    "results" "jsonb" NOT NULL,
    "status" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."mem_calculations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."mem_comments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "mem_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "depth_interval" "text",
    "comment_text" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."mem_comments" OWNER TO "postgres";


COMMENT ON TABLE "public"."mem_comments" IS 'Stores user comments on specific MEMs, potentially linked to depth intervals.';



CREATE TABLE IF NOT EXISTS "public"."mem_edge_function_jobs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "function_name" "text" NOT NULL,
    "status" "text" DEFAULT 'queued'::"text" NOT NULL,
    "input_payload" "jsonb",
    "error_message" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."mem_edge_function_jobs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."mem_mechanical_properties" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid" NOT NULL,
    "properties" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."mem_mechanical_properties" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."mem_pressure_data" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid" NOT NULL,
    "pressure_points" "jsonb",
    "pore_pressure_method" "text",
    "pore_pressure_params" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."mem_pressure_data" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."mem_projects" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "project_name" "text" NOT NULL,
    "description" "text",
    "unit_system" "text" DEFAULT 'metric'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."mem_projects" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."mem_scenarios" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "session_id" "uuid",
    "name" "text",
    "description" "text",
    "parameters" "jsonb",
    "status" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."mem_scenarios" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."mem_team_access" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "well_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "access_level" "text" NOT NULL,
    "granted_by" "uuid" NOT NULL,
    "granted_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."mem_team_access" OWNER TO "postgres";


COMMENT ON TABLE "public"."mem_team_access" IS 'Manages collaborative access to MEM wells.';



CREATE TABLE IF NOT EXISTS "public"."mem_trajectories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid" NOT NULL,
    "trajectory_data" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."mem_trajectories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."mem_versions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "mem_id" "uuid" NOT NULL,
    "created_by" "uuid" NOT NULL,
    "version_number" integer NOT NULL,
    "changes" "jsonb",
    "change_description" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."mem_versions" OWNER TO "postgres";


COMMENT ON TABLE "public"."mem_versions" IS 'Audit trail for versions and changes to a specific MEM.';



CREATE TABLE IF NOT EXISTS "public"."mem_well_data" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "well_id" "uuid" NOT NULL,
    "data_type" "text" NOT NULL,
    "data" "jsonb" NOT NULL,
    "uploaded_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."mem_well_data" OWNER TO "postgres";


COMMENT ON TABLE "public"."mem_well_data" IS 'Stores raw and processed data for a specific well, like logs, points, etc.';



CREATE TABLE IF NOT EXISTS "public"."mem_well_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid" NOT NULL,
    "well_name" "text" NOT NULL,
    "log_data" "jsonb" NOT NULL,
    "curve_map" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."mem_well_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."mem_wells" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "well_name" "text" NOT NULL,
    "location" "text",
    "latitude" numeric,
    "longitude" numeric,
    "depth_range" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."mem_wells" OWNER TO "postgres";


COMMENT ON TABLE "public"."mem_wells" IS 'Stores header information for wells used in MEM calculations.';



CREATE TABLE IF NOT EXISTS "public"."mems" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "well_id" "uuid" NOT NULL,
    "created_by" "uuid" NOT NULL,
    "version" integer DEFAULT 1 NOT NULL,
    "mode" "text" NOT NULL,
    "template" "text",
    "failure_criteria" "text" NOT NULL,
    "status" "text" NOT NULL,
    "properties" "jsonb",
    "stresses" "jsonb",
    "mud_window" "jsonb",
    "risk_indicators" "jsonb",
    "calculation_time_ms" bigint,
    "calibration_quality" "text",
    "assumptions" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."mems" OWNER TO "postgres";


COMMENT ON TABLE "public"."mems" IS 'Stores the calculated Mechanical Earth Model results and configurations.';



CREATE TABLE IF NOT EXISTS "public"."mental_health_assessments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "assessment_date" "date" DEFAULT CURRENT_DATE,
    "stress_level" integer,
    "work_life_balance_rating" integer,
    "mental_health_support_needed" boolean DEFAULT false,
    "support_type" "text"[],
    "confidential" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."mental_health_assessments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."moc_actions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "moc_id" "uuid" NOT NULL,
    "action_type" "text" NOT NULL,
    "description" "text" NOT NULL,
    "assigned_to" "uuid",
    "due_date" "date",
    "status" "text" DEFAULT 'Open'::"text",
    "completed_at" timestamp with time zone,
    "closure_comments" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."moc_actions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."moc_activity_log" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "moc_id" "uuid" NOT NULL,
    "actor_id" "uuid",
    "action" "text" NOT NULL,
    "details" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."moc_activity_log" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."moc_approvals" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "moc_id" "uuid" NOT NULL,
    "approver_id" "uuid" NOT NULL,
    "role" "text",
    "level" integer DEFAULT 1,
    "status" "text" DEFAULT 'Pending'::"text",
    "comments" "text",
    "decision_date" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."moc_approvals" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."moc_comments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "moc_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "comment_text" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."moc_comments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."moc_impacts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "moc_id" "uuid" NOT NULL,
    "impact_area" "text" NOT NULL,
    "description" "text",
    "severity" "text",
    "mitigation" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."moc_impacts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."moc_records" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid" NOT NULL,
    "moc_code" "text" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "justification" "text",
    "category" "text" NOT NULL,
    "type" "text" NOT NULL,
    "stage" "text" DEFAULT 'Draft'::"text",
    "priority" "text" DEFAULT 'Medium'::"text",
    "risk_level" "text",
    "originator_id" "uuid",
    "owner_id" "uuid",
    "department" "text",
    "asset_id" "text",
    "target_implementation_date" "date",
    "expiry_date" "date",
    "actual_implementation_date" timestamp with time zone,
    "closure_date" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid"
);


ALTER TABLE "public"."moc_records" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."moc_reviews" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "moc_id" "uuid" NOT NULL,
    "reviewer_id" "uuid" NOT NULL,
    "discipline" "text",
    "status" "text" DEFAULT 'Pending'::"text",
    "comments" "text",
    "due_date" "date",
    "completed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."moc_reviews" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."model_training_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "training_start_time" timestamp with time zone DEFAULT "now"() NOT NULL,
    "training_end_time" timestamp with time zone,
    "data_points_analyzed" integer,
    "models_trained" "text"[],
    "accuracy_metrics" "jsonb",
    "predictions_generated" integer,
    "status" "text" NOT NULL,
    "error_message" "text",
    "progress" integer DEFAULT 0,
    "current_step" "text"
);


ALTER TABLE "public"."model_training_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."model_versions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid",
    "version_number" "text",
    "status" "text",
    "accuracy_score" numeric,
    "precision_score" numeric,
    "recall_score" numeric,
    "f1_score" numeric,
    "training_date" timestamp with time zone,
    "dataset_size" integer,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."model_versions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."module_access" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid",
    "module_id" "text",
    "is_unlocked" boolean DEFAULT false,
    "unlocked_date" timestamp with time zone,
    "access_level" "text"
);


ALTER TABLE "public"."module_access" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."modules" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "description" "text",
    "icon" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."modules" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."mud_programs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "well_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "program_details" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."mud_programs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."nextgen_registrations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "full_name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "category" "text" NOT NULL,
    "institution" "text",
    "details" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."nextgen_registrations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."offset_surveys" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "offset_well_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "stations" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."offset_surveys" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."offset_wells" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "surface_northing" numeric,
    "surface_easting" numeric,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."offset_wells" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."org_members" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid",
    "user_id" "uuid",
    "role" "text",
    "invited_at" timestamp with time zone,
    "joined_at" timestamp with time zone DEFAULT "now"(),
    "invited_by" "uuid",
    CONSTRAINT "org_members_role_check" CHECK (("role" = ANY (ARRAY['super_admin'::"text", 'org_admin'::"text", 'editor'::"text", 'reviewer'::"text", 'viewer'::"text"])))
);


ALTER TABLE "public"."org_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."org_settings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid" NOT NULL,
    "logo_url" "text",
    "theme_preference" "text" DEFAULT 'dark'::"text",
    "primary_color" "text" DEFAULT '#FFC107'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "notification_settings" "jsonb" DEFAULT '{"weekly_digest": true, "incident_alerts": true}'::"jsonb",
    "compliance_threshold" integer DEFAULT 80,
    "secondary_logo_url" "text",
    "favicon_url" "text",
    "secondary_color" "text" DEFAULT '#1a1a2e'::"text",
    "accent_color" "text" DEFAULT '#FFC107'::"text",
    "font_heading" "text" DEFAULT 'Inter'::"text",
    "font_body" "text" DEFAULT 'Inter'::"text",
    "border_radius" "text" DEFAULT '0.5rem'::"text",
    "theme_preset" "text" DEFAULT 'modern'::"text",
    "custom_css" "text",
    "branding_config" "jsonb" DEFAULT '{}'::"jsonb"
);


ALTER TABLE "public"."org_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."organization_apps" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "app_id" "text" NOT NULL,
    "module_id" "text" NOT NULL,
    "seats_allocated" integer NOT NULL,
    "seats_used" integer DEFAULT 0,
    "status" "text" DEFAULT 'ACTIVE'::"text",
    "created_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."organization_apps" OWNER TO "postgres";


COMMENT ON TABLE "public"."organization_apps" IS 'AUTHORITATIVE table for app subscriptions, seat allocation, and app availability per organization.';



CREATE TABLE IF NOT EXISTS "public"."organization_assets" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid",
    "name" "text" NOT NULL,
    "asset_id" "text",
    "category" "text",
    "description" "text",
    "location" "text",
    "assigned_to" "text",
    "purchase_date" "date",
    "warranty_expiry" "date",
    "safety_status" "text" DEFAULT 'safe'::"text",
    "safety_notes" "text",
    "maintenance_schedule" "text",
    "last_inspection" "date",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."organization_assets" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."organization_audit_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "actor_id" "uuid",
    "action" "text" NOT NULL,
    "resource_type" "text",
    "resource_id" "text",
    "details" "jsonb",
    "ip_address" "text",
    "user_agent" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."organization_audit_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."organization_branding" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "subscription_tier" "text",
    "is_branding_enabled" boolean DEFAULT false,
    "logo_url" "text",
    "logo_file_name" "text",
    "favicon_url" "text",
    "primary_color" "text" DEFAULT '#FFC107'::"text",
    "secondary_color" "text" DEFAULT '#1F2937'::"text",
    "accent_color" "text" DEFAULT '#3B82F6'::"text",
    "text_color" "text" DEFAULT '#FFFFFF'::"text",
    "background_color" "text" DEFAULT '#111827'::"text",
    "font_family" "text" DEFAULT 'Inter'::"text",
    "font_size_base" integer DEFAULT 16,
    "border_radius" "text" DEFAULT 'md'::"text",
    "button_style" "text" DEFAULT 'solid'::"text",
    "sidebar_style" "text" DEFAULT 'dark'::"text",
    "company_name" "text",
    "company_tagline" "text",
    "support_email" "text",
    "support_phone" "text",
    "website_url" "text",
    "social_links" "jsonb" DEFAULT '{"twitter": "", "facebook": "", "linkedin": "", "instagram": ""}'::"jsonb",
    "custom_css" "text",
    "login_page_background" "text" DEFAULT 'default'::"text",
    "login_page_bg_url" "text",
    "show_powered_by" boolean DEFAULT true,
    "custom_footer_text" "text",
    "theme_mode" "text" DEFAULT 'dark'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "updated_by" "uuid",
    CONSTRAINT "organization_branding_subscription_tier_check" CHECK (("subscription_tier" = ANY (ARRAY['free'::"text", 'premium'::"text", 'enterprise'::"text"])))
);


ALTER TABLE "public"."organization_branding" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."organization_members" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "user_id" "uuid",
    "full_name" "text" NOT NULL,
    "email" "text" NOT NULL,
    "role" "text" DEFAULT 'viewer'::"text" NOT NULL,
    "status" "text" DEFAULT 'invited'::"text" NOT NULL,
    "invited_at" timestamp with time zone DEFAULT "now"(),
    "joined_at" timestamp with time zone,
    "invitation_token" "text",
    "invitation_expires_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "can_request_access" boolean DEFAULT true
);


ALTER TABLE "public"."organization_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."organization_sites" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "address" "text",
    "latitude" numeric,
    "longitude" numeric,
    "site_type" "text",
    "area_sqm" numeric,
    "employees_count" integer,
    "is_active" boolean DEFAULT true,
    "is_primary" boolean DEFAULT false,
    "contact_person" "text",
    "contact_email" "text",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    "map_marker_data" "jsonb",
    "qr_token" "uuid" DEFAULT "gen_random_uuid"(),
    "qr_enabled" boolean DEFAULT true,
    CONSTRAINT "organization_sites_site_type_check" CHECK (("site_type" = ANY (ARRAY['facility'::"text", 'office'::"text", 'warehouse'::"text", 'plant'::"text", 'field'::"text", 'other'::"text"])))
);


ALTER TABLE "public"."organization_sites" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."organization_users" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "modules" "text"[] NOT NULL,
    "role" "text" DEFAULT 'user'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "apps" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "user_role" "text" DEFAULT 'staff_admin'::"text",
    "status" "text" DEFAULT 'active'::"text",
    "updated_at" timestamp without time zone DEFAULT "now"(),
    CONSTRAINT "organization_users_user_role_check" CHECK (("user_role" = ANY (ARRAY['super_admin'::"text", 'org_admin'::"text", 'manager'::"text", 'supervisor'::"text", 'staff_admin'::"text", 'contractor'::"text", 'consultant'::"text", 'intern'::"text"]))),
    CONSTRAINT "valid_user_roles" CHECK (("user_role" = ANY (ARRAY['super_admin'::"text", 'org_admin'::"text", 'staff_admin'::"text", 'manager'::"text", 'supervisor'::"text", 'contractor'::"text", 'consultant'::"text", 'intern'::"text"])))
);


ALTER TABLE "public"."organization_users" OWNER TO "postgres";


COMMENT ON COLUMN "public"."organization_users"."modules" IS 'DEPRECATED: Legacy entitlement column. Do not read or write. Replaced by org_app_subscriptions.';



COMMENT ON COLUMN "public"."organization_users"."role" IS 'DEPRECATED: Do not use. Use user_role instead.';



COMMENT ON COLUMN "public"."organization_users"."apps" IS 'DEPRECATED: Legacy entitlement column. Do not read or write. Replaced by org_app_subscriptions.';



CREATE TABLE IF NOT EXISTS "public"."organizations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "contact_email" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "hse_enabled_legacy" boolean DEFAULT false,
    "hse_subscription_tier_legacy" character varying(50) DEFAULT 'free'::character varying,
    "hse_subscription_expires_at_legacy" timestamp without time zone,
    "hse_config_legacy" "jsonb" DEFAULT '{}'::"jsonb",
    "subscription_tier" "text" DEFAULT 'free'::"text",
    "is_hse_only_legacy" boolean DEFAULT false,
    "modules_legacy" "text"[] DEFAULT '{HSE}'::"text"[],
    "created_by" "uuid",
    "app_type_legacy" "text" DEFAULT 'suite'::"text",
    "industry" "text",
    "subscription_status" "text" DEFAULT 'active'::"text",
    "subscribed_modules_legacy" "text"[] DEFAULT ARRAY['hse_free'::"text"],
    "primary_app_legacy" "text" DEFAULT 'suite'::"text",
    "allow_hse_access_legacy" boolean DEFAULT true,
    "auto_add_hse_free_legacy" boolean DEFAULT true,
    "last_accessed_app_legacy" "text" DEFAULT 'suite'::"text",
    "num_employees" integer,
    "setup_completed" boolean DEFAULT false,
    "setup_completed_at" timestamp without time zone,
    "hse_status" "text" DEFAULT 'NONE'::"text",
    "suite_status" "text" DEFAULT 'NONE'::"text",
    "created_via" "text" DEFAULT 'admin'::"text",
    "organization_type" "text" DEFAULT 'customer'::"text",
    CONSTRAINT "organizations_organization_type_check" CHECK (("organization_type" = ANY (ARRAY['customer'::"text", 'internal'::"text", 'partner'::"text", 'consultant'::"text", 'sandbox'::"text"]))),
    CONSTRAINT "organizations_subscription_tier_check" CHECK (("subscription_tier" = ANY (ARRAY['free'::"text", 'premium'::"text"])))
);


ALTER TABLE "public"."organizations" OWNER TO "postgres";


COMMENT ON TABLE "public"."organizations" IS 'Core organization identity table. App entitlement is authoritative in organization_apps. Legacy columns retained for backward compatibility only.';



COMMENT ON COLUMN "public"."organizations"."hse_enabled_legacy" IS 'LEGACY — HSE access is free and no longer controlled here.';



COMMENT ON COLUMN "public"."organizations"."modules_legacy" IS 'LEGACY — Do not use. App visibility is controlled by organization_apps.';



COMMENT ON COLUMN "public"."organizations"."subscribed_modules_legacy" IS 'LEGACY — Replaced by organization_apps.';



CREATE TABLE IF NOT EXISTS "public"."payment_audit_log" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "payment_id" "uuid",
    "action" "text",
    "details" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "text" DEFAULT 'system'::"text"
);


ALTER TABLE "public"."payment_audit_log" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."payment_methods" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "paystack_auth_code" "text" NOT NULL,
    "paystack_email" "text",
    "card_last4" "text",
    "card_exp_month" "text",
    "card_exp_year" "text",
    "card_type" "text",
    "bank_name" "text",
    "is_default" boolean DEFAULT false,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "last_used_at" timestamp with time zone
);


ALTER TABLE "public"."payment_methods" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."payment_notifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "payment_id" "uuid",
    "notification_type" "text",
    "recipient_email" "text",
    "subject" "text",
    "body" "text",
    "sent_at" timestamp with time zone DEFAULT "now"(),
    "delivery_status" "text" DEFAULT 'sent'::"text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."payment_notifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."payments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "quote_id" "uuid" NOT NULL,
    "amount" numeric NOT NULL,
    "currency" "text" DEFAULT 'NGN'::"text",
    "paystack_reference" "text" NOT NULL,
    "paystack_access_code" "text",
    "status" "text" DEFAULT 'PENDING'::"text",
    "payment_method" "text",
    "paid_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "webhook_retry_count" integer DEFAULT 0,
    "webhook_last_retry_at" timestamp with time zone,
    "webhook_error_message" "text",
    "idempotency_key" "uuid" DEFAULT "gen_random_uuid"(),
    "paystack_status" "text",
    "local_status" "text",
    "status_mismatch_detected" boolean DEFAULT false,
    "notification_sent" boolean DEFAULT false,
    "notification_sent_at" timestamp with time zone,
    "error_severity" "text" DEFAULT 'low'::"text",
    "requires_manual_intervention" boolean DEFAULT false,
    "payment_type" "text" DEFAULT 'initial'::"text",
    "subscription_id" "uuid",
    "renewal_attempt_number" integer
);


ALTER TABLE "public"."payments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."peer_review_audit" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "review_id" "uuid",
    "actor_id" "uuid",
    "action" "text" NOT NULL,
    "details" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."peer_review_audit" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."peer_review_comments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "review_id" "uuid",
    "author_id" "uuid",
    "comment_text" "text" NOT NULL,
    "severity" "text" DEFAULT 'Minor'::"text",
    "status" "text" DEFAULT 'Open'::"text",
    "discipline" "text",
    "response_text" "text",
    "responded_by" "uuid",
    "responded_at" timestamp with time zone,
    "verified_by" "uuid",
    "verified_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."peer_review_comments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."peer_reviews" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid",
    "review_code" "text" NOT NULL,
    "title" "text" NOT NULL,
    "review_type" "text" NOT NULL,
    "project_asset" "text",
    "department" "text",
    "discipline" "text",
    "coordinator_id" "uuid",
    "lead_reviewer_id" "uuid",
    "author_id" "uuid",
    "stage" "text" DEFAULT 'Draft'::"text",
    "priority" "text" DEFAULT 'Medium'::"text",
    "due_date" "date",
    "decision" "text",
    "scope_description" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid"
);


ALTER TABLE "public"."peer_reviews" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."permissions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "resource" "text" NOT NULL,
    "action" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."permissions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."permit_approvals" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "permit_id" "uuid",
    "approver_id" "uuid",
    "approval_level" integer DEFAULT 1,
    "status" "text" DEFAULT 'Pending'::"text",
    "comments" "text",
    "rejection_reason" "text",
    "approved_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."permit_approvals" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."permit_templates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "permit_type" "text",
    "default_duration_hours" integer DEFAULT 8,
    "hazards" "jsonb" DEFAULT '[]'::"jsonb",
    "control_measures" "jsonb" DEFAULT '[]'::"jsonb",
    "ppe_requirements" "jsonb" DEFAULT '[]'::"jsonb",
    "emergency_procedures" "text",
    "equipment_required" "jsonb" DEFAULT '[]'::"jsonb",
    "approval_chain" "jsonb" DEFAULT '[]'::"jsonb",
    "compliance_rules" "jsonb" DEFAULT '[]'::"jsonb",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid"
);


ALTER TABLE "public"."permit_templates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."petrophysics_activity_log" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid",
    "user_id" "uuid",
    "action_type" "text" NOT NULL,
    "description" "text",
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."petrophysics_activity_log" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."petrophysics_channels" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid",
    "name" "text" NOT NULL,
    "description" "text",
    "type" "text" DEFAULT 'public'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid"
);


ALTER TABLE "public"."petrophysics_channels" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."petrophysics_comments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid",
    "user_id" "uuid",
    "content" "text" NOT NULL,
    "target_type" "text",
    "target_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."petrophysics_comments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."petrophysics_correlation_lines" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid",
    "user_id" "uuid",
    "source_well_id" "uuid",
    "target_well_id" "uuid",
    "source_depth" numeric NOT NULL,
    "target_depth" numeric NOT NULL,
    "type" "text" DEFAULT 'formation'::"text",
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."petrophysics_correlation_lines" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."petrophysics_curves" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "well_id" "uuid" NOT NULL,
    "mnemonic" "text" NOT NULL,
    "unit" "text",
    "data" numeric[] NOT NULL,
    "description" "text"
);


ALTER TABLE "public"."petrophysics_curves" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."petrophysics_markers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "well_id" "uuid" NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "name" "text" NOT NULL,
    "depth" numeric NOT NULL,
    "type" "text" DEFAULT 'Formation'::"text",
    "color" "text" DEFAULT '#FFD700'::"text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."petrophysics_markers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."petrophysics_messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "channel_id" "uuid",
    "user_id" "uuid",
    "content" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "attachments" "jsonb"
);


ALTER TABLE "public"."petrophysics_messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."petrophysics_monte_carlo_runs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid",
    "well_id" "uuid",
    "zone_name" "text" NOT NULL,
    "iterations" integer NOT NULL,
    "inputs" "jsonb" NOT NULL,
    "results" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."petrophysics_monte_carlo_runs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."petrophysics_notifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "project_id" "uuid",
    "type" "text" NOT NULL,
    "title" "text" NOT NULL,
    "message" "text",
    "link" "text",
    "is_read" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."petrophysics_notifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."petrophysics_project_versions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid",
    "created_by" "uuid",
    "name" "text",
    "version_number" integer,
    "data_snapshot" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."petrophysics_project_versions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."petrophysics_projects" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."petrophysics_projects" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."petrophysics_qc_reports" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid",
    "well_id" "uuid",
    "report_date" timestamp with time zone DEFAULT "now"(),
    "score" numeric,
    "flags" "jsonb",
    "stats" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."petrophysics_qc_reports" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."petrophysics_reserves" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "well_id" "uuid",
    "zone_name" "text" NOT NULL,
    "top_depth" numeric,
    "base_depth" numeric,
    "parameters" "jsonb",
    "results" "jsonb",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"())
);


ALTER TABLE "public"."petrophysics_reserves" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."petrophysics_team_members" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid",
    "user_id" "uuid",
    "role" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "petrophysics_team_members_role_check" CHECK (("role" = ANY (ARRAY['admin'::"text", 'editor'::"text", 'viewer'::"text"])))
);


ALTER TABLE "public"."petrophysics_team_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."petrophysics_wells" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "api_number" "text",
    "operator" "text",
    "location" "text",
    "min_depth" numeric,
    "max_depth" numeric,
    "step" numeric,
    "curve_aliases" "jsonb" DEFAULT '{}'::"jsonb",
    "las_header" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."petrophysics_wells" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."petrophysics_wiki_pages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid",
    "title" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "content" "text",
    "category" "text",
    "tags" "text"[],
    "last_updated_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."petrophysics_wiki_pages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."phishing_results" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "simulation_id" "uuid",
    "organization_id" "uuid",
    "email_opened" boolean DEFAULT false,
    "link_clicked" boolean DEFAULT false,
    "reported" boolean DEFAULT false,
    "reported_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."phishing_results" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."phishing_simulations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid",
    "simulation_date" "date",
    "email_subject" "text",
    "email_body" "text",
    "total_sent" integer DEFAULT 0,
    "total_clicked" integer DEFAULT 0,
    "total_reported" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."phishing_simulations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."pm_app_integrations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid",
    "app_name" "text" NOT NULL,
    "last_sync" timestamp with time zone,
    "sync_status" "text" DEFAULT 'Disconnected'::"text",
    "data_count" integer DEFAULT 0
);


ALTER TABLE "public"."pm_app_integrations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."pm_deliverables" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid",
    "name" "text" NOT NULL,
    "app_source" "text" NOT NULL,
    "version" "text" DEFAULT 'v1.0'::"text",
    "status" "text" DEFAULT 'Draft'::"text",
    "linked_gate" "uuid",
    "linked_tasks" "uuid"[],
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "approved_date" timestamp with time zone,
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."pm_deliverables" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."pm_integration_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid",
    "app_name" "text",
    "action" "text",
    "timestamp" timestamp with time zone DEFAULT "now"(),
    "status" "text"
);


ALTER TABLE "public"."pm_integration_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."pm_integrations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid",
    "service_name" "text" NOT NULL,
    "config" "jsonb" DEFAULT '{}'::"jsonb",
    "status" "text" DEFAULT 'disconnected'::"text",
    "last_sync_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."pm_integrations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."pm_resource_assignments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "task_id" "uuid",
    "resource_id" "uuid",
    "role" "text",
    "allocated_hours" numeric DEFAULT 0,
    "allocation_percent" numeric DEFAULT 100,
    "start_date" "date",
    "end_date" "date",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."pm_resource_assignments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."pm_resources" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid",
    "name" "text" NOT NULL,
    "type" "text" DEFAULT 'Person'::"text",
    "discipline" "text",
    "availability_percent" numeric DEFAULT 100,
    "cost_per_day" numeric DEFAULT 0,
    "skills" "text"[],
    "contact_info" "jsonb",
    "department" "text",
    "status" "text" DEFAULT 'Active'::"text",
    "cv_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."pm_resources" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."portfolio_projects" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "capex" numeric NOT NULL,
    "npv_p10" numeric NOT NULL,
    "npv_p50" numeric NOT NULL,
    "npv_p90" numeric NOT NULL,
    "risk_score" numeric,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."portfolio_projects" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."portfolio_scenario_projects" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "portfolio_id" "uuid" NOT NULL,
    "project_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL
);


ALTER TABLE "public"."portfolio_scenario_projects" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."portfolio_snapshots" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "snapshot_date" "date" DEFAULT CURRENT_DATE,
    "total_projects" integer,
    "total_budget" numeric,
    "total_actual_cost" numeric,
    "avg_cpi" numeric,
    "avg_spi" numeric,
    "risk_count" integer,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."portfolio_snapshots" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."portfolios" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "capex_limit" numeric,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."portfolios" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."positions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "department_id" "uuid",
    "name" character varying(255) NOT NULL,
    "level" character varying(50),
    "created_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."positions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."predictions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "prediction_type" "text" NOT NULL,
    "predicted_value" "jsonb" NOT NULL,
    "probability" numeric,
    "confidence_level" numeric,
    "timeframe" "text",
    "affected_department" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "expires_at" timestamp with time zone,
    "actual_outcome" boolean
);


ALTER TABLE "public"."predictions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."premium_subscriptions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid",
    "tier" "text" NOT NULL,
    "features_enabled" "text"[],
    "expires_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."premium_subscriptions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."pressure_gradients" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "well_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "md_m" numeric NOT NULL,
    "pore_grad_sg" numeric NOT NULL,
    "frac_grad_sg" numeric NOT NULL,
    CONSTRAINT "pore_less_than_frac_check" CHECK (("pore_grad_sg" < "frac_grad_sg")),
    CONSTRAINT "pressure_gradients_frac_grad_sg_check" CHECK ((("frac_grad_sg" >= 0.6) AND ("frac_grad_sg" <= 2.5))),
    CONSTRAINT "pressure_gradients_md_m_check" CHECK (("md_m" >= (0)::numeric)),
    CONSTRAINT "pressure_gradients_pore_grad_sg_check" CHECK ((("pore_grad_sg" >= 0.6) AND ("pore_grad_sg" <= 2.5)))
);


ALTER TABLE "public"."pressure_gradients" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."pricing_config" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "key" "text" NOT NULL,
    "value" "jsonb" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."pricing_config" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."pricing_tiers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "price_monthly" numeric NOT NULL,
    "price_annual" numeric NOT NULL,
    "description" "text",
    "features" "text"[],
    "user_limit" integer,
    "storage_limit_gb" integer,
    "support_level" "text",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."pricing_tiers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."production_data" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "well_id" "text" NOT NULL,
    "well_name" "text",
    "production_rate" numeric,
    "pressure" numeric,
    "temperature" numeric,
    "status" "text",
    "timestamp" timestamp with time zone NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."production_data" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."production_surveillance_projects" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "project_name" "text" NOT NULL,
    "inputs_data" "jsonb",
    "results_data" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."production_surveillance_projects" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."project_issues" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid",
    "title" "text" NOT NULL,
    "description" "text",
    "occurred_date" "date",
    "reported_date" "date" DEFAULT CURRENT_DATE,
    "resolved_date" "date",
    "owner" "text",
    "resolution" "text",
    "status" "text" DEFAULT 'Open'::"text",
    "linked_risk_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()),
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"())
);


ALTER TABLE "public"."project_issues" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."project_members" (
    "project_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role" "text" NOT NULL,
    CONSTRAINT "project_members_role_check" CHECK (("role" = ANY (ARRAY['owner'::"text", 'editor'::"text", 'viewer'::"text"])))
);


ALTER TABLE "public"."project_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."project_updates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid" NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "report_date" "date" DEFAULT CURRENT_DATE,
    "status" "text",
    "percent_complete" numeric,
    "narrative" "text",
    "blockers" "text",
    "decisions_needed" "text",
    "spi" numeric,
    "cpi" numeric,
    "earned_value" numeric,
    "planned_value" numeric,
    "actual_cost" numeric,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "project_updates_status_check" CHECK (("status" = ANY (ARRAY['Green'::"text", 'Amber'::"text", 'Red'::"text"])))
);


ALTER TABLE "public"."project_updates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."projects" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "start_date" "date",
    "baseline_budget" numeric,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "company_name" "text",
    "project_type" "text",
    "stage" "text" DEFAULT 'Concept'::"text",
    "country" "text",
    "asset" "text",
    "status" "text" DEFAULT 'Green'::"text",
    "owner" "text",
    "percent_complete" numeric DEFAULT 0
);


ALTER TABLE "public"."projects" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."property_overrides" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "session_id" "uuid",
    "depth_top" numeric,
    "depth_base" numeric,
    "overrides" "jsonb",
    "correlations" "jsonb",
    "lab_data" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."property_overrides" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."pta_files" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid" NOT NULL,
    "file_url" "text" NOT NULL,
    "kind" "text" NOT NULL,
    "meta" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."pta_files" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."pta_projects" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "well_name" "text",
    "reservoir" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "inputs_data" "jsonb",
    "results_data" "jsonb"
);


ALTER TABLE "public"."pta_projects" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."pta_runs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid" NOT NULL,
    "status" "text" NOT NULL,
    "model" "text",
    "inputs" "jsonb",
    "results" "jsonb",
    "plots" "jsonb",
    "report_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."pta_runs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."pta_telemetry" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "run_id" "uuid",
    "fn" "text" NOT NULL,
    "duration_ms" integer,
    "ok" boolean,
    "error" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."pta_telemetry" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."public_qr_sites" AS
 SELECT "qr_token",
    "organization_id",
    "id" AS "site_id",
    "name",
    "qr_enabled"
   FROM "public"."organization_sites"
  WHERE ("qr_enabled" = true);


ALTER VIEW "public"."public_qr_sites" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."purchased_apps" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid",
    "app_id" "text" NOT NULL,
    "module_id" "text",
    "status" "text" DEFAULT 'active'::"text",
    "purchase_date" timestamp with time zone DEFAULT "now"(),
    "expiry_date" timestamp with time zone,
    "seats_allocated" integer DEFAULT 5
);


ALTER TABLE "public"."purchased_apps" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."pvt_results" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "api_gravity_input" double precision,
    "bubble_point_pressure_psi" double precision,
    "oil_fvf_at_pb_bbl_stb" double precision,
    "user_id" "uuid" DEFAULT "gen_random_uuid"()
);


ALTER TABLE "public"."pvt_results" OWNER TO "postgres";


COMMENT ON TABLE "public"."pvt_results" IS 'Stores results from the PVT QuickLook calculator.';



ALTER TABLE "public"."pvt_results" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."pvt_results_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."quick_report_media" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "report_id" "uuid",
    "media_url" "text" NOT NULL,
    "media_type" "text" NOT NULL,
    "uploaded_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid" DEFAULT "auth"."uid"()
);


ALTER TABLE "public"."quick_report_media" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."quick_report_notifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "recipient_user_id" "uuid" NOT NULL,
    "quick_report_id" "uuid" NOT NULL,
    "read_status" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."quick_report_notifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."quick_reports" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "created_by_user_id" "uuid",
    "report_data" "jsonb" NOT NULL,
    "status" "text" DEFAULT 'open'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "team_id" "uuid",
    "assigned_to" "uuid",
    "title" "text",
    "description" "text",
    "audio_blob_url" "text",
    "transcription" "text",
    "severity" "text",
    "location" "text",
    "quality_score" numeric DEFAULT 0,
    "leaderboard_points" numeric DEFAULT 0,
    "closed_at" timestamp with time zone,
    "root_cause" "text",
    "corrective_action" "text",
    "category" character varying,
    "hazard_id" "text",
    "people_involved" "jsonb",
    "immediate_actions" "text",
    "corrective_actions" "text",
    "hazard_classification" "text",
    "witnesses" "jsonb" DEFAULT '[]'::"jsonb",
    "injured_persons" "jsonb" DEFAULT '[]'::"jsonb",
    "severity_self_assessment" "text",
    "media_urls" "jsonb" DEFAULT '[]'::"jsonb",
    "additional_notes" "text",
    "site_id" "uuid",
    "department_id" "uuid",
    "investigation_whys" "jsonb" DEFAULT '[]'::"jsonb",
    "investigation_completed_at" timestamp with time zone,
    "preventive_actions" "text",
    "lessons_learned" "text"
);


ALTER TABLE "public"."quick_reports" OWNER TO "postgres";


COMMENT ON COLUMN "public"."quick_reports"."category" IS 'Optional category for quick reports';



COMMENT ON COLUMN "public"."quick_reports"."hazard_classification" IS 'Optional risk level';



CREATE TABLE IF NOT EXISTS "public"."quickvol_activity_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "scenario_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "action" "text" NOT NULL,
    "details" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."quickvol_activity_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."quickvol_api_keys" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "name" "text" NOT NULL,
    "key_prefix" "text" NOT NULL,
    "key_hash" "text" NOT NULL,
    "scopes" "text"[] DEFAULT '{}'::"text"[],
    "rate_limit" integer DEFAULT 1000,
    "usage_count" integer DEFAULT 0,
    "last_used_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "status" "text" DEFAULT 'active'::"text"
);


ALTER TABLE "public"."quickvol_api_keys" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."quickvol_comments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "scenario_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "content" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."quickvol_comments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."quickvol_generated_reports" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "project_id" "uuid",
    "title" "text" NOT NULL,
    "report_type" "text",
    "file_url" "text",
    "metadata" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."quickvol_generated_reports" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."quickvol_integration_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "source" "text" NOT NULL,
    "endpoint" "text",
    "status" integer,
    "details" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."quickvol_integration_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."quickvol_ml_models" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "project_id" "uuid",
    "name" "text" NOT NULL,
    "type" "text" NOT NULL,
    "target_parameter" "text",
    "algorithm" "text",
    "status" "text" DEFAULT 'trained'::"text",
    "metrics" "jsonb",
    "feature_importance" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."quickvol_ml_models" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."quickvol_predictions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "model_id" "uuid",
    "user_id" "uuid",
    "input_data" "jsonb" NOT NULL,
    "prediction_result" "jsonb" NOT NULL,
    "confidence_score" numeric,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."quickvol_predictions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."quickvol_report_templates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "layout" "jsonb" NOT NULL,
    "settings" "jsonb",
    "is_public" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."quickvol_report_templates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."quickvol_validation_runs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid",
    "user_id" "uuid",
    "run_type" "text" NOT NULL,
    "status" "text" NOT NULL,
    "score" integer,
    "issues" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."quickvol_validation_runs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."quickvol_versions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "scenario_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "version_number" integer NOT NULL,
    "data" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "commit_message" "text"
);


ALTER TABLE "public"."quickvol_versions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."quickvol_webhooks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "url" "text" NOT NULL,
    "events" "text"[] NOT NULL,
    "secret" "text",
    "status" "text" DEFAULT 'active'::"text",
    "failure_count" integer DEFAULT 0,
    "last_triggered_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."quickvol_webhooks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."quickvol_workspace_members" (
    "workspace_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role" "text" NOT NULL,
    "joined_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "quickvol_workspace_members_role_check" CHECK (("role" = ANY (ARRAY['admin'::"text", 'editor'::"text", 'viewer'::"text"])))
);


ALTER TABLE "public"."quickvol_workspace_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."quickvol_workspaces" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "owner_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."quickvol_workspaces" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."quotes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "quote_id" "text" NOT NULL,
    "modules" "jsonb" NOT NULL,
    "apps" "jsonb" NOT NULL,
    "seats" integer NOT NULL,
    "billing_term" "text" NOT NULL,
    "add_ons" "jsonb",
    "total_amount" numeric(10,2) NOT NULL,
    "currency" "text" DEFAULT 'USD'::"text",
    "validity_period" timestamp without time zone NOT NULL,
    "status" "text" DEFAULT 'PENDING'::"text",
    "created_at" timestamp without time zone DEFAULT "now"(),
    "updated_at" timestamp without time zone DEFAULT "now"(),
    "pdf_url" "text",
    "email_sent" boolean DEFAULT false,
    "email_sent_at" timestamp with time zone,
    "paystack_link" "text",
    "org_admin_email" "text",
    "quote_number" "text",
    "selected_items" "jsonb",
    "pricing_breakdown" "jsonb",
    "quote_date" timestamp with time zone DEFAULT "now"(),
    "expiry_date" timestamp with time zone,
    "modules_purchased" "jsonb" DEFAULT '[]'::"jsonb",
    "payment_verified" boolean DEFAULT false,
    "payment_verified_at" timestamp with time zone,
    "user_id" "uuid",
    "user_seats" integer DEFAULT 5,
    "billing_period" "text" DEFAULT 'annual'::"text",
    "expires_at" timestamp without time zone
);


ALTER TABLE "public"."quotes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."rb_cases" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "org_id" "uuid",
    "name" "text" NOT NULL,
    "description" "text",
    "field_name" "text",
    "reservoir_name" "text",
    "fluid_system" "text" DEFAULT 'oil'::"text" NOT NULL,
    "has_aquifer" boolean DEFAULT false NOT NULL,
    "has_gas_cap" boolean DEFAULT false NOT NULL,
    "volumetric_ooip_stb" double precision,
    "volumetric_ogip_scf" double precision,
    "volumetric_estimate_source" "text",
    "initial_pressure_psia" double precision,
    "bubble_point_psia" double precision,
    "reservoir_temperature_f" double precision,
    "initial_water_saturation" double precision,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "archived_at" timestamp with time zone,
    CONSTRAINT "rb_cases_fluid_system_check" CHECK (("fluid_system" = ANY (ARRAY['oil'::"text", 'gas'::"text", 'oil_with_gas_cap'::"text"])))
);


ALTER TABLE "public"."rb_cases" OWNER TO "postgres";


COMMENT ON TABLE "public"."rb_cases" IS 'Top-level entity for a Reservoir Balance (MBAL) study. User-owned.';



CREATE TABLE IF NOT EXISTS "public"."rb_production_data" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "case_id" "uuid" NOT NULL,
    "timestep_index" integer NOT NULL,
    "observation_date" "date",
    "pressure_psia" double precision NOT NULL,
    "cum_oil_stb" double precision DEFAULT 0,
    "cum_gas_scf" double precision DEFAULT 0,
    "cum_water_stb" double precision DEFAULT 0,
    "cum_water_inj_stb" double precision DEFAULT 0,
    "cum_gas_inj_scf" double precision DEFAULT 0,
    "bo_rb_stb" double precision,
    "rs_scf_stb" double precision,
    "bg_rb_mscf" double precision,
    "bw_rb_stb" double precision,
    "z_factor" double precision,
    "observed_we_rb" double precision,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."rb_production_data" OWNER TO "postgres";


COMMENT ON TABLE "public"."rb_production_data" IS 'Time-series production/pressure/PVT input. One row per timestep.';



CREATE TABLE IF NOT EXISTS "public"."rb_results" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "run_id" "uuid" NOT NULL,
    "case_id" "uuid" NOT NULL,
    "estimated_ooip_stb" double precision,
    "estimated_ogip_scf" double precision,
    "r_squared" double precision,
    "regression_slope" double precision,
    "regression_intercept" double precision,
    "n_data_points" integer,
    "aquifer_owip_rb" double precision,
    "aquifer_cumulative_we_rb" double precision,
    "aquifer_fit_quality" double precision,
    "final_ddi" double precision,
    "final_gdi" double precision,
    "final_wdi" double precision,
    "final_sdi" double precision,
    "final_drive_index_sum" double precision,
    "drive_mechanism" "text",
    "aquifer_strength" "text",
    "warnings" "text"[],
    "plot_data" "jsonb",
    "volumetric_reconciliation" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "final_cdi" double precision
);


ALTER TABLE "public"."rb_results" OWNER TO "postgres";


COMMENT ON TABLE "public"."rb_results" IS 'Output of a successful MBAL run: scalar results + plot data JSONB.';



CREATE TABLE IF NOT EXISTS "public"."rb_run_configs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "case_id" "uuid" NOT NULL,
    "name" "text" DEFAULT 'Default Run'::"text" NOT NULL,
    "is_scenario" boolean DEFAULT false NOT NULL,
    "pvt_source" "text" DEFAULT 'correlated'::"text" NOT NULL,
    "pvt_correlations" "jsonb" DEFAULT '{"water": "mccain", "pb_rs_bo": "standing", "z_factor": "hall_yarborough", "gas_viscosity": "lee_gonzalez_eakin", "oil_viscosity": "beggs_robinson"}'::"jsonb" NOT NULL,
    "pvt_lab_table" "jsonb",
    "oil_gravity_api" double precision,
    "gas_specific_gravity" double precision,
    "water_salinity_ppm" double precision,
    "formation_compressibility_psi" double precision,
    "water_compressibility_psi" double precision,
    "aquifer_model" "text" DEFAULT 'none'::"text",
    "aquifer_params" "jsonb",
    "aquifer_history_match" boolean DEFAULT false NOT NULL,
    "gas_cap_ratio_m" double precision,
    "solver_method" "text" DEFAULT 'havlena_odeh'::"text" NOT NULL,
    "excluded_timesteps" integer[] DEFAULT '{}'::integer[],
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "rb_run_configs_aquifer_model_check" CHECK (("aquifer_model" = ANY (ARRAY['none'::"text", 'pot'::"text", 'fetkovich'::"text", 'carter_tracy'::"text"]))),
    CONSTRAINT "rb_run_configs_pvt_source_check" CHECK (("pvt_source" = ANY (ARRAY['correlated'::"text", 'lab_table'::"text", 'mixed'::"text"]))),
    CONSTRAINT "rb_run_configs_solver_method_check" CHECK (("solver_method" = ANY (ARRAY['havlena_odeh'::"text", 'p_over_z'::"text", 'p_over_z_modified'::"text", 'pot_aquifer_plot'::"text"])))
);


ALTER TABLE "public"."rb_run_configs" OWNER TO "postgres";


COMMENT ON TABLE "public"."rb_run_configs" IS 'Configuration for one MBAL calculation: PVT, aquifer, solver choices.';



COMMENT ON COLUMN "public"."rb_run_configs"."pvt_lab_table" IS 'Optional PVT lab table for interpolation. Array of {pressure_psia, bo_rb_stb, rs_scf_stb, bg_rb_mscf, z_factor, bw_rb_stb, oil_viscosity_cp, gas_viscosity_cp}. Engine interpolates at each timestep pressure; falls back to correlations if absent or out-of-range. Structural validation performed at runtime by validateLabTable() in mbal-engine.ts (Postgres CHECK constraints cannot contain the jsonb_array_elements subquery this would require). Added in Capsule 4C chunk (b) 2026-05-15.';



CREATE TABLE IF NOT EXISTS "public"."rb_runs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "case_id" "uuid" NOT NULL,
    "run_config_id" "uuid" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "error_message" "text",
    "error_detail" "jsonb",
    "started_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "completed_at" timestamp with time zone,
    "duration_ms" integer,
    "parent_run_id" "uuid",
    "run_type" "text" DEFAULT 'single'::"text" NOT NULL,
    "engine_version" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "rb_runs_run_type_check" CHECK (("run_type" = ANY (ARRAY['single'::"text", 'sensitivity'::"text", 'monte_carlo'::"text"]))),
    CONSTRAINT "rb_runs_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'running'::"text", 'completed'::"text", 'failed'::"text"])))
);


ALTER TABLE "public"."rb_runs" OWNER TO "postgres";


COMMENT ON TABLE "public"."rb_runs" IS 'Execution record for one MBAL calculation attempt.';



CREATE TABLE IF NOT EXISTS "public"."recommendations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid",
    "recommendation_type" "text",
    "title" "text" NOT NULL,
    "description" "text",
    "affected_department" "text",
    "affected_area" "text",
    "predicted_incident_type" "text",
    "expected_risk_reduction" "text",
    "implementation_effort" "text",
    "timeline" "text",
    "status" "text" DEFAULT 'pending'::"text",
    "success_metrics" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."recommendations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."regulatory_authorities" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "acronym" "text",
    "jurisdiction" "text",
    "contact_name" "text",
    "email" "text",
    "phone" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."regulatory_authorities" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."regulatory_obligations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid" NOT NULL,
    "authority_id" "uuid",
    "title" "text" NOT NULL,
    "description" "text",
    "facility" "text",
    "due_date" "date",
    "status" "text" DEFAULT 'Draft'::"text",
    "owner_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."regulatory_obligations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."renewal_audit_log" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "subscription_id" "uuid",
    "organization_id" "uuid",
    "action" "text" NOT NULL,
    "details" "jsonb",
    "performed_by" "text" DEFAULT 'system'::"text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."renewal_audit_log" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."renewal_notifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "subscription_id" "uuid",
    "organization_id" "uuid",
    "notification_type" "text" NOT NULL,
    "recipient_email" "text" NOT NULL,
    "subject" "text",
    "content_html" "text",
    "sent_at" timestamp with time zone DEFAULT "now"(),
    "status" "text" DEFAULT 'sent'::"text",
    "error_message" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."renewal_notifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."renewal_reminders" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "module_id" "text" NOT NULL,
    "reminder_type" "text" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text",
    "scheduled_for" "date" NOT NULL,
    "sent_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."renewal_reminders" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."report_shares" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "report_id" "uuid" NOT NULL,
    "shared_by" "uuid" NOT NULL,
    "shared_with" character varying(255),
    "share_type" character varying(50),
    "created_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."report_shares" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."reports" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "type" "text" NOT NULL,
    "title" "text" NOT NULL,
    "content" "jsonb" DEFAULT '{}'::"jsonb",
    "generated_date" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."reports" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."reservoir_activities" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "reservoir_id" "uuid" NOT NULL,
    "description" "text" NOT NULL,
    "timestamp" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."reservoir_activities" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."reservoir_analyses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "reservoir_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "type" "text" NOT NULL,
    "inputs" "jsonb",
    "results" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."reservoir_analyses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."reservoircalc_projects" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "name" "text" NOT NULL,
    "description" "text",
    "inputs" "jsonb" NOT NULL,
    "results" "jsonb",
    "settings" "jsonb",
    "version" integer DEFAULT 1,
    "is_template" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."reservoircalc_projects" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."reservoirs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "basin" "text",
    "field" "text",
    "country" "text",
    "operator" "text",
    "fluid" "text",
    "drive" "text",
    "unit_system" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."reservoirs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."resources" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "type" "text",
    "rate" numeric,
    "unit" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."resources" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."retraining_jobs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid",
    "status" "text",
    "triggered_by" "text",
    "start_time" timestamp with time zone,
    "end_time" timestamp with time zone,
    "logs" "jsonb",
    "new_model_version_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."retraining_jobs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."return_to_work_plans" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "incident_id" "uuid",
    "medical_clearance_date" "date",
    "rtw_start_date" "date",
    "rtw_end_date" "date",
    "current_phase" integer DEFAULT 1,
    "phase_1_hours" integer,
    "phase_2_hours" integer,
    "phase_3_hours" integer,
    "restrictions_accommodations" "text",
    "supervisor_id" "uuid",
    "status" "text" DEFAULT 'Active'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."return_to_work_plans" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."risk_actions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "risk_id" "uuid",
    "action_owner_id" "uuid",
    "title" "text" NOT NULL,
    "description" "text",
    "status" "text" DEFAULT 'Open'::"text",
    "due_date" "date",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."risk_actions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."risk_activity_log" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "risk_id" "uuid",
    "user_id" "uuid",
    "action" "text" NOT NULL,
    "details" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."risk_activity_log" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."risk_attachments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "risk_id" "uuid",
    "file_name" "text" NOT NULL,
    "file_url" "text" NOT NULL,
    "uploaded_by" "uuid",
    "uploaded_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."risk_attachments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."risk_comments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "risk_id" "uuid",
    "user_id" "uuid",
    "comment_text" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."risk_comments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."risk_kris" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "risk_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "frequency" "text",
    "threshold_warning" numeric,
    "threshold_critical" numeric,
    "current_value" numeric,
    "unit" "text",
    "status" "text",
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."risk_kris" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."risk_links" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "source_risk_id" "uuid" NOT NULL,
    "target_risk_id" "uuid" NOT NULL,
    "link_type" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."risk_links" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."risk_mitigation_actions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "risk_id" "uuid" NOT NULL,
    "description" "text" NOT NULL,
    "strategy" "text",
    "owner_id" "uuid",
    "status" "text" DEFAULT 'Not Started'::"text",
    "start_date" "date",
    "due_date" "date",
    "completion_date" "date",
    "progress" integer DEFAULT 0,
    "budget" numeric,
    "spent" numeric,
    "effectiveness" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."risk_mitigation_actions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."risk_register" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid" NOT NULL,
    "risk_id" "text" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "category" "text" NOT NULL,
    "status" "text" DEFAULT 'Open'::"text",
    "likelihood" integer,
    "impact" integer,
    "risk_score" integer GENERATED ALWAYS AS (("likelihood" * "impact")) STORED,
    "rating" "text",
    "owner_id" "uuid",
    "root_cause" "text",
    "consequences" "text",
    "appetite_status" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    "mitigation_summary" "text",
    CONSTRAINT "risk_register_impact_check" CHECK ((("impact" >= 1) AND ("impact" <= 5))),
    CONSTRAINT "risk_register_likelihood_check" CHECK ((("likelihood" >= 1) AND ("likelihood" <= 5)))
);


ALTER TABLE "public"."risk_register" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."risk_register_snapshots" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "snapshot_data" "jsonb" NOT NULL,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."risk_register_snapshots" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."risk_reviews" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "risk_id" "uuid",
    "reviewer_id" "uuid",
    "review_date" timestamp with time zone DEFAULT "now"(),
    "comments" "text",
    "next_review_date" "date"
);


ALTER TABLE "public"."risk_reviews" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."risk_scenarios" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "type" "text",
    "probability" "text",
    "impact_financial" numeric,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."risk_scenarios" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."risk_tags" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "risk_id" "uuid" NOT NULL,
    "tag" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."risk_tags" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."risks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid" NOT NULL,
    "description" "text" NOT NULL,
    "probability" numeric,
    "impact" numeric,
    "mitigation_plan" "text",
    "owner" "text",
    "status" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "title" "text",
    "category" "text",
    "risk_score" integer,
    "due_date" "date",
    "linked_well" "text",
    "linked_depth_interval" "text",
    "linked_app" "text",
    "ppfg_source" boolean DEFAULT false,
    "updated_at" timestamp with time zone
);


ALTER TABLE "public"."risks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."role_permissions" (
    "role_id" "uuid" NOT NULL,
    "permission_id" "uuid" NOT NULL
);


ALTER TABLE "public"."role_permissions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."roles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."roles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."rto_connections" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "well_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "start_ts" timestamp with time zone NOT NULL,
    "end_ts" timestamp with time zone NOT NULL,
    "depth_start_m" numeric,
    "depth_end_m" numeric,
    "conn_time_sec" numeric,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."rto_connections" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."rto_projects" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "project_name" "text" NOT NULL,
    "inputs_data" "jsonb",
    "results_data" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."rto_projects" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."rto_settings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "well_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "wob_min_klbf" numeric,
    "wob_max_klbf" numeric,
    "rpm_min" numeric,
    "rpm_max" numeric,
    "flow_min_gpm" numeric,
    "flow_max_gpm" numeric,
    "td_warn_klbf" numeric,
    "td_crit_klbf" numeric,
    "ecd_margin_sg" numeric,
    "enabled" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."rto_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."safety_audits" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "site_id" "uuid",
    "audit_date" timestamp with time zone DEFAULT "now"(),
    "auditor_id" "uuid",
    "compliance_score" numeric(5,2),
    "findings" "jsonb" DEFAULT '[]'::"jsonb",
    "status" "text" DEFAULT 'completed'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."safety_audits" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."safety_moment_categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "icon" "text",
    "color" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."safety_moment_categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."safety_moment_downloads" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "moment_id" "uuid",
    "user_id" "uuid",
    "format" "text",
    "downloaded_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."safety_moment_downloads" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."safety_moment_shares" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "moment_id" "uuid",
    "shared_by" "uuid",
    "shared_with_email" "text",
    "shared_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."safety_moment_shares" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."safety_moment_views" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "moment_id" "uuid",
    "user_id" "uuid",
    "viewed_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."safety_moment_views" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."safety_moments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "category_id" "uuid",
    "title" "text" NOT NULL,
    "description" "text",
    "content" "text",
    "key_points" "text"[],
    "discussion_questions" "text"[],
    "duration" integer,
    "difficulty_level" "text",
    "tags" "text"[],
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "likes_count" integer DEFAULT 0,
    "shares_count" integer DEFAULT 0,
    "is_featured" boolean DEFAULT false,
    "language" "text" DEFAULT 'English'::"text",
    "rating" numeric DEFAULT 0,
    "when_to_use" "text",
    "why_it_matters" "text",
    "do_list" "text"[],
    "dont_list" "text"[],
    "incident_scenario" "jsonb",
    "site_checklist" "text"[],
    "one_minute_recap" "text",
    "references" "text"[],
    CONSTRAINT "safety_moments_difficulty_level_check" CHECK (("difficulty_level" = ANY (ARRAY['Beginner'::"text", 'Intermediate'::"text", 'Advanced'::"text"])))
);


ALTER TABLE "public"."safety_moments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."safety_points" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "points" integer NOT NULL,
    "reason" character varying(255),
    "report_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."safety_points" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."safety_scores" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid",
    "score" numeric NOT NULL,
    "category_breakdown" "jsonb",
    "calculated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."safety_scores" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."saved_casing_design_projects" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "project_name" "text" NOT NULL,
    "inputs_data" "jsonb" NOT NULL,
    "results_data" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."saved_casing_design_projects" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."saved_compressor_pump_projects" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "project_name" "text" NOT NULL,
    "inputs_data" "jsonb" NOT NULL,
    "results_data" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."saved_compressor_pump_projects" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."saved_dca_projects" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "project_name" "text" NOT NULL,
    "inputs_data" "jsonb" NOT NULL,
    "results_data" "jsonb" NOT NULL,
    "original_file_data" "text",
    "file_name" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."saved_dca_projects" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."saved_drilling_fluids_projects" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "project_name" "text" NOT NULL,
    "inputs_data" "jsonb" NOT NULL,
    "results_data" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."saved_drilling_fluids_projects" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."saved_heat_exchanger_projects" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "project_name" "text" NOT NULL,
    "inputs_data" "jsonb" NOT NULL,
    "results_data" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."saved_heat_exchanger_projects" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."saved_mbal_projects" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "project_name" "text" NOT NULL,
    "inputs_data" "jsonb" NOT NULL,
    "results_data" "jsonb",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."saved_mbal_projects" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."saved_nodal_analysis_projects" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "project_name" "text" NOT NULL,
    "inputs_data" "jsonb" NOT NULL,
    "results_data" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."saved_nodal_analysis_projects" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."saved_petrophysics_projects" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "project_name" "text" NOT NULL,
    "inputs_data" "jsonb" NOT NULL,
    "results_data" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."saved_petrophysics_projects" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."saved_pipeline_sizer_projects" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "project_name" "text" NOT NULL,
    "inputs_data" "jsonb" NOT NULL,
    "results_data" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."saved_pipeline_sizer_projects" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."saved_pvt_projects" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "project_name" "text" NOT NULL,
    "inputs_data" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "results_data" "jsonb" NOT NULL,
    "reservoir_id" "uuid"
);


ALTER TABLE "public"."saved_pvt_projects" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."saved_quickvol_projects" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "project_name" "text" NOT NULL,
    "mode" "text" NOT NULL,
    "inputs_data" "jsonb" NOT NULL,
    "results_data" "jsonb" NOT NULL,
    "file_names" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "workspace_id" "uuid"
);


ALTER TABLE "public"."saved_quickvol_projects" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."saved_relief_projects" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "project_name" "text" NOT NULL,
    "inputs_data" "jsonb" NOT NULL,
    "results_data" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."saved_relief_projects" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."saved_report_autopilot_projects" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "project_name" "text" NOT NULL,
    "inputs_data" "jsonb" NOT NULL,
    "results_data" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."saved_report_autopilot_projects" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."saved_reports" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "type" "text" NOT NULL,
    "config" "jsonb" NOT NULL,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."saved_reports" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."saved_reservoir_balance_projects" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "project_name" "text" NOT NULL,
    "inputs_data" "jsonb",
    "results_data" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."saved_reservoir_balance_projects" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."saved_well_cost_iq_projects" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "project_name" "text" NOT NULL,
    "inputs_data" "jsonb" NOT NULL,
    "results_data" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."saved_well_cost_iq_projects" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."saved_well_cost_projects" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "project_name" "text" NOT NULL,
    "inputs_data" "jsonb" NOT NULL,
    "results_data" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."saved_well_cost_projects" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."scenario_comparisons" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "name" "text",
    "scenarios" "jsonb",
    "comparison_results" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."scenario_comparisons" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."scheduled_safety_moments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "moment_id" "uuid",
    "scheduled_by" "uuid",
    "scheduled_for" timestamp with time zone NOT NULL,
    "team_id" "uuid",
    "status" "text" DEFAULT 'scheduled'::"text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."scheduled_safety_moments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."security_incidents" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "severity" "text",
    "status" "text",
    "type" "text",
    "location_text" "text",
    "assigned_to" "uuid",
    "reported_by" "uuid",
    "incident_date" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "security_incidents_severity_check" CHECK (("severity" = ANY (ARRAY['Low'::"text", 'Medium'::"text", 'High'::"text", 'Critical'::"text"]))),
    CONSTRAINT "security_incidents_status_check" CHECK (("status" = ANY (ARRAY['Open'::"text", 'Investigating'::"text", 'Resolved'::"text", 'Closed'::"text"])))
);


ALTER TABLE "public"."security_incidents" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."security_knowledge_assessments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "organization_id" "uuid",
    "assessment_date" "date",
    "assessment_type" "text",
    "score" integer,
    "weak_areas" "text"[],
    "recommended_training" "text"[],
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."security_knowledge_assessments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."security_profiles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "organization_id" "uuid",
    "security_risk_score" integer DEFAULT 0,
    "awareness_score" integer DEFAULT 0,
    "training_completion_percentage" integer DEFAULT 0,
    "last_training_date" timestamp with time zone,
    "next_training_due_date" timestamp with time zone,
    "incident_count_this_year" integer DEFAULT 0,
    "last_incident_date" timestamp with time zone,
    "compliance_status" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "security_profiles_compliance_status_check" CHECK (("compliance_status" = ANY (ARRAY['Compliant'::"text", 'Non-Compliant'::"text", 'Pending'::"text"])))
);


ALTER TABLE "public"."security_profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."security_training" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "organization_id" "uuid",
    "training_type" "text",
    "training_module" "text",
    "training_date" "date",
    "completion_date" "date",
    "status" "text",
    "score" integer,
    "certificate_url" "text",
    "next_training_due_date" "date",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "security_training_status_check" CHECK (("status" = ANY (ARRAY['Not Started'::"text", 'In Progress'::"text", 'Completed'::"text", 'Overdue'::"text"])))
);


ALTER TABLE "public"."security_training" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."shared_data_registry" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "user_id" "uuid" NOT NULL,
    "project_id" "uuid",
    "well_id" "uuid",
    "reservoir_id" "uuid",
    "source_app_id" "text" NOT NULL,
    "source_record_id" "uuid" NOT NULL,
    "data_category" "text" NOT NULL,
    "data_name" "text" NOT NULL,
    "description" "text",
    "payload" "jsonb" NOT NULL,
    "version" integer DEFAULT 1,
    "is_public_to_org" boolean DEFAULT false,
    "tags" "text"[]
);


ALTER TABLE "public"."shared_data_registry" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sim_cases" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "case_name" "text" NOT NULL,
    "overrides" "jsonb",
    "status" "text" DEFAULT 'Defined'::"text" NOT NULL,
    "results" "jsonb",
    "history_match_score" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."sim_cases" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sim_projects" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "reservoir_id" "uuid",
    "project_name" "text" NOT NULL,
    "base_deck_info" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."sim_projects" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sip_faults" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "version_id" "uuid" NOT NULL,
    "volume_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "color" "text" DEFAULT '#ff0000'::"text",
    "storage_path" "text",
    "metadata_jsonb" "jsonb" DEFAULT '{}'::"jsonb",
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."sip_faults" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sip_horizons" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "version_id" "uuid" NOT NULL,
    "volume_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "color" "text" DEFAULT '#ffffff'::"text",
    "storage_path" "text",
    "metadata_jsonb" "jsonb" DEFAULT '{}'::"jsonb",
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."sip_horizons" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sip_jobs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid" NOT NULL,
    "job_type" "public"."sip_job_type_enum" NOT NULL,
    "status" "public"."sip_status_enum" DEFAULT 'PENDING'::"public"."sip_status_enum" NOT NULL,
    "input_jsonb" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "output_jsonb" "jsonb" DEFAULT '{}'::"jsonb",
    "error_text" "text",
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "started_at" timestamp with time zone,
    "completed_at" timestamp with time zone
);


ALTER TABLE "public"."sip_jobs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sip_projects" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "crs_epsg" integer,
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone
);


ALTER TABLE "public"."sip_projects" OWNER TO "postgres";


COMMENT ON COLUMN "public"."sip_projects"."organization_id" IS 'Future-proofing RLS: strict tenant isolation';



CREATE TABLE IF NOT EXISTS "public"."sip_surveys" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "asset_type" "public"."sip_asset_type_enum" DEFAULT '3D'::"public"."sip_asset_type_enum" NOT NULL,
    "domain_type" "public"."sip_domain_type_enum" DEFAULT 'TIME'::"public"."sip_domain_type_enum" NOT NULL,
    "metadata_jsonb" "jsonb" DEFAULT '{}'::"jsonb",
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone
);


ALTER TABLE "public"."sip_surveys" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sip_uploads" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "survey_id" "uuid" NOT NULL,
    "file_name" "text" NOT NULL,
    "file_hash" "text",
    "file_size" bigint,
    "storage_path" "text" NOT NULL,
    "status" "public"."sip_status_enum" DEFAULT 'PENDING'::"public"."sip_status_enum" NOT NULL,
    "qc_report_jsonb" "jsonb" DEFAULT '{}'::"jsonb",
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."sip_uploads" OWNER TO "postgres";


COMMENT ON COLUMN "public"."sip_uploads"."file_hash" IS 'Index for upload deduplication';



CREATE TABLE IF NOT EXISTS "public"."sip_versions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "workspace_id" "uuid" NOT NULL,
    "parent_version_id" "uuid",
    "name" "text" NOT NULL,
    "commit_message" "text",
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."sip_versions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sip_volumes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "survey_id" "uuid" NOT NULL,
    "source_upload_id" "uuid",
    "name" "text" NOT NULL,
    "format" "text" DEFAULT 'ZARR'::"text" NOT NULL,
    "storage_path" "text" NOT NULL,
    "inline_min" integer,
    "inline_max" integer,
    "xline_min" integer,
    "xline_max" integer,
    "z_min" numeric,
    "z_max" numeric,
    "z_step" numeric,
    "stats_jsonb" "jsonb" DEFAULT '{}'::"jsonb",
    "status" "public"."sip_status_enum" DEFAULT 'ACTIVE'::"public"."sip_status_enum" NOT NULL,
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone
);


ALTER TABLE "public"."sip_volumes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sip_workspaces" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "visibility" "public"."sip_visibility_enum" DEFAULT 'PRIVATE'::"public"."sip_visibility_enum" NOT NULL,
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone
);


ALTER TABLE "public"."sip_workspaces" OWNER TO "postgres";


COMMENT ON COLUMN "public"."sip_workspaces"."visibility" IS 'RLS field: defines if team members can collaborate';



CREATE TABLE IF NOT EXISTS "public"."site_locations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "site_id" "uuid" NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "location_type" "text",
    "parent_location_id" "uuid",
    "latitude" numeric,
    "longitude" numeric,
    "is_active" boolean DEFAULT true,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid",
    CONSTRAINT "site_locations_location_type_check" CHECK (("location_type" = ANY (ARRAY['building'::"text", 'floor'::"text", 'department'::"text", 'zone'::"text", 'equipment'::"text", 'other'::"text"])))
);


ALTER TABLE "public"."site_locations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."sites" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid",
    "name" "text" NOT NULL,
    "location_description" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."sites" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ss_assets" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid" NOT NULL,
    "type" "text" NOT NULL,
    "name" "text" NOT NULL,
    "domain" "public"."asset_domain",
    "uri" "text",
    "meta" "jsonb",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    "parent_id" "uuid"
);


ALTER TABLE "public"."ss_assets" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ss_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid" NOT NULL,
    "actor" "uuid",
    "action" "text" NOT NULL,
    "meta" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_by" "uuid"
);


ALTER TABLE "public"."ss_events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ss_projects" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "crs_epsg" integer,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."ss_projects" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ss_styles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "payload" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "created_by" "uuid"
);


ALTER TABLE "public"."ss_styles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ss_versions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid" NOT NULL,
    "parent_id" "uuid",
    "message" "text",
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."ss_versions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ss_workflow_runs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "workflow_id" "uuid" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "started_at" timestamp with time zone,
    "ended_at" timestamp with time zone,
    "logs" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."ss_workflow_runs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ss_workflows" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "payload" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."ss_workflows" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."stress_overrides" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "session_id" "uuid",
    "regime" "text",
    "tectonic_strain" "jsonb",
    "anisotropy" numeric,
    "calibration" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."stress_overrides" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."studio_access_tokens" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "studio_user_id" "uuid" NOT NULL,
    "token" "text" NOT NULL,
    "token_label" "text",
    "role" "text" NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "revoked_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "studio_access_tokens_role_check" CHECK (("role" = ANY (ARRAY['super_admin'::"text", 'admin'::"text", 'developer'::"text", 'reviewer'::"text", 'intern'::"text"])))
);


ALTER TABLE "public"."studio_access_tokens" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."studio_users" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "full_name" "text" NOT NULL,
    "email" "text",
    "role" "text" NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "studio_users_role_check" CHECK (("role" = ANY (ARRAY['super_admin'::"text", 'admin'::"text", 'developer'::"text", 'reviewer'::"text", 'intern'::"text"])))
);


ALTER TABLE "public"."studio_users" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."subscription_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "module_id" "text" NOT NULL,
    "event_type" "text" NOT NULL,
    "event_date" timestamp with time zone DEFAULT "now"(),
    "details" "jsonb",
    "performed_by" "uuid"
);


ALTER TABLE "public"."subscription_events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."subscription_modules" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "is_premium" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."subscription_modules" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."subscription_usage" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "module_id" "text" NOT NULL,
    "date" "date" NOT NULL,
    "active_users_count" integer DEFAULT 0,
    "sessions_count" integer DEFAULT 0,
    "storage_used_gb" numeric DEFAULT 0,
    "api_calls_count" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."subscription_usage" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."subscriptions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "modules" "text"[] NOT NULL,
    "user_limit" integer NOT NULL,
    "start_date" "date",
    "end_date" "date" NOT NULL,
    "term" "text" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "quote_details" "jsonb",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "quote_id" "uuid",
    "billing_period" "text" DEFAULT 'annual'::"text",
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "expires_at" timestamp with time zone,
    "renewal_date" timestamp with time zone,
    "next_renewal_date" "date",
    "renewal_status" "text" DEFAULT 'pending'::"text",
    "renewal_attempt_count" integer DEFAULT 0,
    "last_renewal_attempt_at" timestamp with time zone,
    "last_renewal_error" "text",
    "suspension_reason" "text",
    "requires_manual_intervention" boolean DEFAULT false,
    "reminder_sent_at" timestamp with time zone,
    "error_severity" "text" DEFAULT 'low'::"text"
);


ALTER TABLE "public"."subscriptions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."super_admin_impersonation_log" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "super_admin_id" "uuid" NOT NULL,
    "impersonated_org_id" "uuid",
    "impersonated_user_id" "uuid",
    "action" "text" NOT NULL,
    "session_start" timestamp with time zone DEFAULT "now"(),
    "session_end" timestamp with time zone,
    "duration_seconds" integer,
    "ip_address" "text",
    "user_agent" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."super_admin_impersonation_log" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."support_ticket_comments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "ticket_id" "uuid",
    "user_id" "uuid",
    "comment" "text" NOT NULL,
    "is_internal" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."support_ticket_comments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."support_tickets" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid",
    "user_id" "uuid",
    "subject" "text" NOT NULL,
    "description" "text" NOT NULL,
    "category" "text",
    "priority" "text",
    "status" "text" DEFAULT 'Open'::"text",
    "attachments" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "support_tickets_priority_check" CHECK (("priority" = ANY (ARRAY['Low'::"text", 'Medium'::"text", 'High'::"text", 'Critical'::"text"]))),
    CONSTRAINT "support_tickets_status_check" CHECK (("status" = ANY (ARRAY['Open'::"text", 'In Progress'::"text", 'Resolved'::"text", 'Closed'::"text"])))
);


ALTER TABLE "public"."support_tickets" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."surveys" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "well_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "survey_name" "text" NOT NULL,
    "stations" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."surveys" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."system_settings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "key" "text" NOT NULL,
    "value" "jsonb" NOT NULL,
    "description" "text"
);


ALTER TABLE "public"."system_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tasks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "owner" "text",
    "parent_task_id" "uuid",
    "planned_start_date" "date",
    "planned_end_date" "date",
    "planned_cost" numeric,
    "percent_complete" numeric DEFAULT 0,
    "actual_cost" numeric DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "type" "text" DEFAULT 'task'::"text",
    "display_order" integer,
    "workstream" "text",
    "task_category" "text",
    "actual_end_date" "date",
    "milestone_details" "jsonb" DEFAULT '{}'::"jsonb",
    "status" "text" DEFAULT 'To Do'::"text",
    "predecessors" "jsonb" DEFAULT '[]'::"jsonb",
    "is_archived" boolean DEFAULT false,
    "priority" "text" DEFAULT 'Medium'::"text",
    "description" "text"
);


ALTER TABLE "public"."tasks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."team_app_access" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "team_id" "uuid" NOT NULL,
    "app_id" "text" NOT NULL,
    "access_level" "text" DEFAULT 'full'::"text",
    "granted_by" "uuid",
    "granted_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."team_app_access" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."team_members" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "team_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role" "text" DEFAULT 'member'::"text",
    "joined_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."team_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."teams" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."teams" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."template_usage" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "template_id" character varying(50) NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "usage_count" integer DEFAULT 0,
    "last_used" timestamp with time zone
);


ALTER TABLE "public"."template_usage" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."templates" (
    "id" character varying(50) NOT NULL,
    "name" character varying(255) NOT NULL,
    "icon" character varying(10),
    "category" character varying(100),
    "severity" character varying(20),
    "description" "text",
    "controls" "text",
    "is_global" boolean DEFAULT true,
    "organization_id" "uuid"
);


ALTER TABLE "public"."templates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tenants" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "partner_id" "uuid",
    "name" "text" NOT NULL,
    "custom_domain" "text",
    "branding_config" "jsonb",
    "status" "text" DEFAULT 'active'::"text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."tenants" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."torque_drag_projects" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "project_name" "text" NOT NULL,
    "inputs_data" "jsonb",
    "results_data" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."torque_drag_projects" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."torque_drag_runs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "well_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "inputs" "jsonb",
    "results" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."torque_drag_runs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."trajectory_plans" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "well_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "plan_name" "text" NOT NULL,
    "is_latest" boolean DEFAULT true,
    "kickoff_md_m" numeric,
    "build_rate_deg_per30m" numeric,
    "hold_inc_deg" numeric,
    "turn_rate_deg_per30m" numeric,
    "target_id" "uuid",
    "stations" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."trajectory_plans" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."transactions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "invoice_id" "uuid" NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "amount" numeric NOT NULL,
    "payment_date" "date" NOT NULL,
    "reference_number" "text",
    "verified_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "receipt_pdf_url" "text"
);


ALTER TABLE "public"."transactions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."trend_analysis" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid",
    "metric_name" "text" NOT NULL,
    "trend_direction" "text",
    "percentage_change" numeric DEFAULT 0,
    "period_start" "date",
    "period_end" "date",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "trend_analysis_trend_direction_check" CHECK (("trend_direction" = ANY (ARRAY['up'::"text", 'down'::"text", 'stable'::"text"])))
);


ALTER TABLE "public"."trend_analysis" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tubular_grades" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "grade" "text" NOT NULL,
    "od_in" numeric NOT NULL,
    "weight_lbft" numeric NOT NULL,
    "drift_in" numeric,
    "yield_psi" numeric NOT NULL,
    "collapse_props" "jsonb",
    "burst_props" "jsonb",
    "e_psi" numeric,
    "nu" numeric,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "od_in_check" CHECK (("od_in" > (0)::numeric)),
    CONSTRAINT "weight_lbft_check" CHECK (("weight_lbft" > (0)::numeric))
);


ALTER TABLE "public"."tubular_grades" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."usage_metrics" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid",
    "period_start" "date" NOT NULL,
    "email_count" integer DEFAULT 0,
    "image_upload_count" integer DEFAULT 0,
    "video_upload_count" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "hse_incident_count" integer DEFAULT 0,
    "hse_observation_count" integer DEFAULT 0
);


ALTER TABLE "public"."usage_metrics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_activity_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "action" "text" NOT NULL,
    "details" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "super_admin_id" "uuid",
    "organization_id" "uuid",
    "ip_address" "text",
    "user_agent" "text",
    "timestamp" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_activity_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_app_access" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "app_name" "text" NOT NULL,
    "subscribed_at" timestamp with time zone DEFAULT "now"(),
    "expires_at" timestamp with time zone,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_app_access" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_badges" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "badge_id" character varying(50) NOT NULL,
    "unlocked_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_badges" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_currency_preference" (
    "user_id" "uuid" NOT NULL,
    "currency_code" "text" DEFAULT 'USD'::"text" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_currency_preference" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_notifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "message" "text",
    "type" "text" DEFAULT 'info'::"text",
    "is_read" boolean DEFAULT false,
    "link" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "organization_id" "uuid",
    "report_id" "uuid",
    "report_type" "text",
    "created_by" "uuid"
);


ALTER TABLE "public"."user_notifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_points_summary" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "total_points" integer DEFAULT 0,
    "current_streak" integer DEFAULT 0,
    "last_report_date" "date",
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "points_earned" integer DEFAULT 0,
    "points_redeemed" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_points_summary" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_positions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "position_id" "uuid",
    "department_id" "uuid",
    "site_id" "uuid",
    "is_primary" boolean DEFAULT true,
    "assigned_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_positions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_preferences" (
    "user_id" "uuid" NOT NULL,
    "theme" "text" DEFAULT 'dark'::"text",
    "notifications" "jsonb" DEFAULT '{"sms": false, "push": true, "email": true, "marketing": false}'::"jsonb",
    "dashboard_layout" "jsonb" DEFAULT '{"widgets": ["stats", "recent_activity", "tasks"]}'::"jsonb",
    "language" "text" DEFAULT 'en'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_preferences" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_profiles" (
    "id" "uuid" NOT NULL,
    "org_id" "uuid",
    "full_name" "text",
    "job_title" "text",
    "phone_number" "text",
    "department_id" "uuid",
    "avatar_url" "text",
    "notification_prefs" "jsonb" DEFAULT '{"sms": false, "email": true, "in_app": true}'::"jsonb",
    "two_factor_enabled" boolean DEFAULT false,
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_saved_moments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "moment_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_saved_moments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" NOT NULL,
    "email" "text",
    "primary_app" "text" DEFAULT 'hse'::"text",
    "subscribed_modules" "text"[] DEFAULT ARRAY['hse'::"text"],
    "last_accessed_app" "text" DEFAULT 'hse'::"text",
    "app_preferences" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "organization_id" "uuid",
    "raw_user_meta_data" "jsonb",
    "is_super_admin" boolean DEFAULT false
);


ALTER TABLE "public"."users" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."v_org_app_seat_usage" AS
 SELECT "oa"."organization_id",
    "oa"."app_id",
    "oa"."seats_allocated",
    "count"("om"."user_id") FILTER (WHERE ("u"."is_super_admin" IS NOT TRUE)) AS "seats_used"
   FROM (("public"."organization_apps" "oa"
     LEFT JOIN "public"."organization_members" "om" ON (("om"."organization_id" = "oa"."organization_id")))
     LEFT JOIN "auth"."users" "u" ON (("u"."id" = "om"."user_id")))
  GROUP BY "oa"."organization_id", "oa"."app_id", "oa"."seats_allocated";


ALTER VIEW "public"."v_org_app_seat_usage" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."vulnerabilities" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid",
    "vulnerability_name" "text",
    "description" "text",
    "severity" "text",
    "affected_systems" "text"[],
    "risk_score" integer DEFAULT 0,
    "remediation_recommendation" "text",
    "remediation_status" "text",
    "remediation_due_date" "date",
    "remediation_completed_date" "date",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "vulnerabilities_remediation_status_check" CHECK (("remediation_status" = ANY (ARRAY['Not Started'::"text", 'In Progress'::"text", 'Completed'::"text"]))),
    CONSTRAINT "vulnerabilities_severity_check" CHECK (("severity" = ANY (ARRAY['Critical'::"text", 'High'::"text", 'Medium'::"text", 'Low'::"text"])))
);


ALTER TABLE "public"."vulnerabilities" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."waterflood_projects" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "reservoir_id" "uuid",
    "project_name" "text" NOT NULL,
    "inputs_data" "jsonb" NOT NULL,
    "results_data" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."waterflood_projects" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."webhooks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid",
    "url" "text" NOT NULL,
    "events" "text"[],
    "secret" "text",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."webhooks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."well_correlation_projects" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "project_name" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."well_correlation_projects" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."well_correlation_wells" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "well_name" "text" NOT NULL,
    "surface_x" numeric,
    "surface_y" numeric,
    "datum" numeric DEFAULT 0,
    "curve_map" "jsonb",
    "curves" "text"[],
    "log_data" "jsonb",
    "tops" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."well_correlation_wells" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."well_targets" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "well_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "tvd_m" numeric(10,2) NOT NULL,
    "x" numeric(10,2) NOT NULL,
    "y" numeric(10,2) NOT NULL,
    "priority" integer,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "target_type" "text" DEFAULT 'Point'::"text" NOT NULL,
    "target_data" "jsonb"
);


ALTER TABLE "public"."well_targets" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."wellbore_flow_projects" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "project_name" "text" NOT NULL,
    "inputs_data" "jsonb",
    "results_data" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."wellbore_flow_projects" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."wells" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid",
    "user_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "status" "public"."well_status" DEFAULT 'Planning'::"public"."well_status",
    "well_type" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "crs" "text",
    "depth_unit" "text",
    "surface_x" numeric DEFAULT 0,
    "surface_y" numeric DEFAULT 0,
    "kb_elev" numeric DEFAULT 0
);


ALTER TABLE "public"."wells" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."work_permits" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organization_id" "uuid" NOT NULL,
    "permit_number" "text",
    "permit_type" "text" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "location" "text",
    "department" "text",
    "priority" "text" DEFAULT 'Medium'::"text",
    "status" "text" DEFAULT 'Draft'::"text",
    "template_id" "uuid",
    "requested_by" "uuid",
    "approved_by" "uuid",
    "supervisor_id" "uuid",
    "contractor_name" "text",
    "start_date" timestamp with time zone,
    "end_date" timestamp with time zone,
    "expiry_date" timestamp with time zone,
    "risk_level" "text" DEFAULT 'Low'::"text",
    "hazards" "jsonb" DEFAULT '[]'::"jsonb",
    "control_measures" "jsonb" DEFAULT '[]'::"jsonb",
    "ppe_requirements" "jsonb" DEFAULT '[]'::"jsonb",
    "emergency_procedures" "text",
    "weather_conditions" "text",
    "equipment_required" "jsonb" DEFAULT '[]'::"jsonb",
    "special_conditions" "text",
    "compliance_checks" "jsonb" DEFAULT '{}'::"jsonb",
    "attachments" "jsonb" DEFAULT '[]'::"jsonb",
    "audit_trail" "jsonb" DEFAULT '[]'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid"
);


ALTER TABLE "public"."work_permits" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."workflow_executions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "workflow_id" "uuid",
    "status" "text" NOT NULL,
    "logs" "jsonb",
    "started_at" timestamp with time zone DEFAULT "now"(),
    "completed_at" timestamp with time zone
);


ALTER TABLE "public"."workflow_executions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."workflow_steps" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "workflow_id" "uuid",
    "step_order" integer NOT NULL,
    "action_type" "text" NOT NULL,
    "action_config" "jsonb",
    "conditions" "jsonb"
);


ALTER TABLE "public"."workflow_steps" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."workflows" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "org_id" "uuid",
    "name" "text" NOT NULL,
    "description" "text",
    "trigger_type" "text" NOT NULL,
    "trigger_config" "jsonb",
    "is_active" boolean DEFAULT false,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."workflows" OWNER TO "postgres";


ALTER TABLE ONLY "hse"."access_logs"
    ADD CONSTRAINT "access_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "hse"."actions"
    ADD CONSTRAINT "actions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "hse"."audit_findings"
    ADD CONSTRAINT "audit_findings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "hse"."audit_log"
    ADD CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "hse"."audit_logs"
    ADD CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "hse"."audit_schedule"
    ADD CONSTRAINT "audit_schedule_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "hse"."competency_assessments"
    ADD CONSTRAINT "competency_assessments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "hse"."competency_framework"
    ADD CONSTRAINT "competency_framework_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "hse"."competency_records"
    ADD CONSTRAINT "competency_records_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "hse"."compliance_checklists"
    ADD CONSTRAINT "compliance_checklists_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "hse"."contractor_alerts"
    ADD CONSTRAINT "contractor_alerts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "hse"."contractor_communications"
    ADD CONSTRAINT "contractor_communications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "hse"."contractor_documents"
    ADD CONSTRAINT "contractor_documents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "hse"."contractor_incidents"
    ADD CONSTRAINT "contractor_incidents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "hse"."contractor_medical_records"
    ADD CONSTRAINT "contractor_medical_records_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "hse"."contractor_reviews"
    ADD CONSTRAINT "contractor_reviews_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "hse"."contractor_site_assignments"
    ADD CONSTRAINT "contractor_site_assignments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "hse"."contractors"
    ADD CONSTRAINT "contractors_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "hse"."environmental_records"
    ADD CONSTRAINT "environmental_records_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "hse"."exposure_log"
    ADD CONSTRAINT "exposure_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "hse"."external_reports"
    ADD CONSTRAINT "external_reports_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "hse"."feature_flags"
    ADD CONSTRAINT "feature_flags_feature_name_key" UNIQUE ("feature_name");



ALTER TABLE ONLY "hse"."feature_flags"
    ADD CONSTRAINT "feature_flags_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "hse"."fire_drills"
    ADD CONSTRAINT "fire_drills_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "hse"."fire_equipment"
    ADD CONSTRAINT "fire_equipment_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "hse"."fire_safety_records"
    ADD CONSTRAINT "fire_safety_records_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "hse"."health_records"
    ADD CONSTRAINT "health_records_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "hse"."internal_audits"
    ADD CONSTRAINT "internal_audits_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "hse"."project_members"
    ADD CONSTRAINT "project_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "hse"."report_attachments"
    ADD CONSTRAINT "report_attachments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "hse"."reports"
    ADD CONSTRAINT "reports_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "hse"."risk_register"
    ADD CONSTRAINT "risk_register_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "hse"."role_definitions"
    ADD CONSTRAINT "role_definitions_organization_id_role_name_key" UNIQUE ("organization_id", "role_name");



ALTER TABLE ONLY "hse"."role_definitions"
    ADD CONSTRAINT "role_definitions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "hse"."roles"
    ADD CONSTRAINT "roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "hse"."safety_inductions"
    ADD CONSTRAINT "safety_inductions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "hse"."safety_moment_analytics"
    ADD CONSTRAINT "safety_moment_analytics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "hse"."safety_moment_categories"
    ADD CONSTRAINT "safety_moment_categories_category_id_key" UNIQUE ("category_id");



ALTER TABLE ONLY "hse"."safety_moment_categories"
    ADD CONSTRAINT "safety_moment_categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "hse"."safety_moment_comments"
    ADD CONSTRAINT "safety_moment_comments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "hse"."safety_moment_ratings"
    ADD CONSTRAINT "safety_moment_ratings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "hse"."safety_moment_subcategories"
    ADD CONSTRAINT "safety_moment_subcategories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "hse"."safety_moment_templates"
    ADD CONSTRAINT "safety_moment_templates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "hse"."safety_moment_templates"
    ADD CONSTRAINT "safety_moment_templates_template_id_key" UNIQUE ("template_id");



ALTER TABLE ONLY "hse"."safety_moments_library"
    ADD CONSTRAINT "safety_moments_library_moment_id_key" UNIQUE ("moment_id");



ALTER TABLE ONLY "hse"."safety_moments_library"
    ADD CONSTRAINT "safety_moments_library_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "hse"."security_incidents"
    ADD CONSTRAINT "security_incidents_incident_code_key" UNIQUE ("incident_code");



ALTER TABLE ONLY "hse"."security_incidents"
    ADD CONSTRAINT "security_incidents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "hse"."spill_records"
    ADD CONSTRAINT "spill_records_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "hse"."spill_response"
    ADD CONSTRAINT "spill_response_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "hse"."subscriptions"
    ADD CONSTRAINT "subscriptions_organization_id_key" UNIQUE ("organization_id");



ALTER TABLE ONLY "hse"."subscriptions"
    ADD CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "hse"."team_communications"
    ADD CONSTRAINT "team_communications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "hse"."team_members"
    ADD CONSTRAINT "team_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "hse"."team_performance"
    ADD CONSTRAINT "team_performance_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "hse"."team_projects"
    ADD CONSTRAINT "team_projects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "hse"."team_resources"
    ADD CONSTRAINT "team_resources_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "hse"."team_tasks"
    ADD CONSTRAINT "team_tasks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "hse"."teams"
    ADD CONSTRAINT "teams_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "hse"."training_attendance"
    ADD CONSTRAINT "training_attendance_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "hse"."training_feedback"
    ADD CONSTRAINT "training_feedback_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "hse"."training_programs"
    ADD CONSTRAINT "training_programs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "hse"."training_records"
    ADD CONSTRAINT "training_records_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "hse"."training_schedule"
    ADD CONSTRAINT "training_schedule_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "hse"."user_safety_moments"
    ADD CONSTRAINT "user_safety_moments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "hse"."waste_management"
    ADD CONSTRAINT "waste_management_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."absence_records"
    ADD CONSTRAINT "absence_records_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."access_audit_log"
    ADD CONSTRAINT "access_audit_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."access_credentials"
    ADD CONSTRAINT "access_credentials_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."access_logs"
    ADD CONSTRAINT "access_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."access_requests"
    ADD CONSTRAINT "access_requests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."actions"
    ADD CONSTRAINT "actions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."afe_changes"
    ADD CONSTRAINT "afe_changes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."afe_cost_items"
    ADD CONSTRAINT "afe_cost_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."afe_invoices"
    ADD CONSTRAINT "afe_invoices_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."afes"
    ADD CONSTRAINT "afes_afe_number_key" UNIQUE ("afe_number");



ALTER TABLE ONLY "public"."afes"
    ADD CONSTRAINT "afes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ai_insights"
    ADD CONSTRAINT "ai_insights_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."alerts"
    ADD CONSTRAINT "alerts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."allocations"
    ADD CONSTRAINT "allocations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."analytics_insights"
    ADD CONSTRAINT "analytics_insights_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."annuli"
    ADD CONSTRAINT "annuli_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."anticollision_checks"
    ADD CONSTRAINT "anticollision_checks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."api_keys"
    ADD CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."app_activity_log"
    ADD CONSTRAINT "app_activity_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."app_analytics_daily"
    ADD CONSTRAINT "app_analytics_daily_organization_id_app_id_date_key" UNIQUE ("organization_id", "app_id", "date");



ALTER TABLE ONLY "public"."app_analytics_daily"
    ADD CONSTRAINT "app_analytics_daily_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."app_seat_assignments"
    ADD CONSTRAINT "app_seat_assignments_organization_id_app_id_seat_number_key" UNIQUE ("organization_id", "app_id", "seat_number");



ALTER TABLE ONLY "public"."app_seat_assignments"
    ADD CONSTRAINT "app_seat_assignments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."apps"
    ADD CONSTRAINT "apps_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."artificial_lift_designs"
    ADD CONSTRAINT "artificial_lift_designs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."asset_summary"
    ADD CONSTRAINT "asset_summary_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."available_modules"
    ADD CONSTRAINT "available_modules_module_name_key" UNIQUE ("module_name");



ALTER TABLE ONLY "public"."available_modules"
    ADD CONSTRAINT "available_modules_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."badge_definitions"
    ADD CONSTRAINT "badge_definitions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."behavioral_anomalies"
    ADD CONSTRAINT "behavioral_anomalies_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."benchmarking_data"
    ADD CONSTRAINT "benchmarking_data_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bf_activity_log"
    ADD CONSTRAINT "bf_activity_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bf_comments"
    ADD CONSTRAINT "bf_comments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bf_jobs"
    ADD CONSTRAINT "bf_jobs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bf_projects"
    ADD CONSTRAINT "bf_projects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bf_team_members"
    ADD CONSTRAINT "bf_team_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bf_team_members"
    ADD CONSTRAINT "bf_team_members_project_id_user_id_key" UNIQUE ("project_id", "user_id");



ALTER TABLE ONLY "public"."bf_versions"
    ADD CONSTRAINT "bf_versions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bf_wells"
    ADD CONSTRAINT "bf_wells_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bhas"
    ADD CONSTRAINT "bhas_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."billing_reports"
    ADD CONSTRAINT "billing_reports_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."branding_audit_log"
    ADD CONSTRAINT "branding_audit_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."branding_presets"
    ADD CONSTRAINT "branding_presets_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."branding_templates"
    ADD CONSTRAINT "branding_templates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."bulk_import_jobs"
    ADD CONSTRAINT "bulk_import_jobs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."calc_runs"
    ADD CONSTRAINT "calc_runs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."calibration_data"
    ADD CONSTRAINT "calibration_data_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."calibration_results"
    ADD CONSTRAINT "calibration_results_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."casing_schemes"
    ADD CONSTRAINT "casing_schemes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."casing_strings"
    ADD CONSTRAINT "casing_strings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."cement_jobs"
    ADD CONSTRAINT "cement_jobs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."cementing_simulation_projects"
    ADD CONSTRAINT "cementing_simulation_projects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."cementing_simulation_projects"
    ADD CONSTRAINT "cementing_simulation_projects_user_id_project_name_key" UNIQUE ("user_id", "project_name");



ALTER TABLE ONLY "public"."completion_plans"
    ADD CONSTRAINT "completion_plans_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."compliance_audits"
    ADD CONSTRAINT "compliance_audits_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."compliance_frameworks"
    ADD CONSTRAINT "compliance_frameworks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."compliance_requirements"
    ADD CONSTRAINT "compliance_requirements_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."compliance_rules"
    ADD CONSTRAINT "compliance_rules_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."connectors"
    ADD CONSTRAINT "connectors_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."contour_projects"
    ADD CONSTRAINT "contour_projects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."custom_fields"
    ADD CONSTRAINT "custom_fields_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."custom_workflows"
    ADD CONSTRAINT "custom_workflows_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."data_quality_metrics"
    ADD CONSTRAINT "data_quality_metrics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."data_uploads"
    ADD CONSTRAINT "data_uploads_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."demo_requests"
    ADD CONSTRAINT "demo_requests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."departments"
    ADD CONSTRAINT "departments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."discount_codes"
    ADD CONSTRAINT "discount_codes_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."discount_codes"
    ADD CONSTRAINT "discount_codes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."doc_activity_log"
    ADD CONSTRAINT "doc_activity_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."doc_categories"
    ADD CONSTRAINT "doc_categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."doc_comments"
    ADD CONSTRAINT "doc_comments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."doc_distribution"
    ADD CONSTRAINT "doc_distribution_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."doc_revisions"
    ADD CONSTRAINT "doc_revisions_document_id_revision_number_key" UNIQUE ("document_id", "revision_number");



ALTER TABLE ONLY "public"."doc_revisions"
    ADD CONSTRAINT "doc_revisions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."doc_workflows"
    ADD CONSTRAINT "doc_workflows_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_org_id_document_number_key" UNIQUE ("org_id", "document_number");



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."drilling_incidents"
    ADD CONSTRAINT "drilling_incidents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."econ_afe_budgets"
    ADD CONSTRAINT "econ_afe_budgets_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."econ_audit_log"
    ADD CONSTRAINT "econ_audit_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."econ_fdp_snapshots"
    ADD CONSTRAINT "econ_fdp_snapshots_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."econ_fiscal_terms"
    ADD CONSTRAINT "econ_fiscal_terms_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."econ_imports"
    ADD CONSTRAINT "econ_imports_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."econ_inputs"
    ADD CONSTRAINT "econ_inputs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."econ_line_items"
    ADD CONSTRAINT "econ_line_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."econ_metrics"
    ADD CONSTRAINT "econ_metrics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."econ_models"
    ADD CONSTRAINT "econ_models_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."econ_models_v2"
    ADD CONSTRAINT "econ_models_v2_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."econ_projects"
    ADD CONSTRAINT "econ_projects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."econ_results"
    ADD CONSTRAINT "econ_results_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."econ_scenario_notes"
    ADD CONSTRAINT "econ_scenario_notes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."econ_scenario_notes"
    ADD CONSTRAINT "econ_scenario_notes_scenario_id_section_key_key" UNIQUE ("scenario_id", "section_key");



ALTER TABLE ONLY "public"."econ_scenarios"
    ADD CONSTRAINT "econ_scenarios_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."econ_scenarios_v2"
    ADD CONSTRAINT "econ_scenarios_v2_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."econ_sensitivity_results"
    ADD CONSTRAINT "econ_sensitivity_results_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."econ_timegrid"
    ADD CONSTRAINT "econ_timegrid_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."em_fault_sticks"
    ADD CONSTRAINT "em_fault_sticks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."em_faults"
    ADD CONSTRAINT "em_faults_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."em_grid_properties"
    ADD CONSTRAINT "em_grid_properties_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."em_grids"
    ADD CONSTRAINT "em_grids_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."em_jobs"
    ADD CONSTRAINT "em_jobs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."em_object_templates"
    ADD CONSTRAINT "em_object_templates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."em_objects"
    ADD CONSTRAINT "em_objects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."em_petro_analyses"
    ADD CONSTRAINT "em_petro_analyses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."em_petro_templates"
    ADD CONSTRAINT "em_petro_templates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."em_projects"
    ADD CONSTRAINT "em_projects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."em_surface_points"
    ADD CONSTRAINT "em_surface_points_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."em_surfaces"
    ADD CONSTRAINT "em_surfaces_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."em_volumes"
    ADD CONSTRAINT "em_volumes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."em_well_logs"
    ADD CONSTRAINT "em_well_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."em_wells"
    ADD CONSTRAINT "em_wells_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."email_templates"
    ADD CONSTRAINT "email_templates_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."email_templates"
    ADD CONSTRAINT "email_templates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."employee_app_access"
    ADD CONSTRAINT "employee_app_access_member_id_app_id_key" UNIQUE ("member_id", "app_id");



ALTER TABLE ONLY "public"."employee_app_access"
    ADD CONSTRAINT "employee_app_access_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."employee_storage"
    ADD CONSTRAINT "employee_storage_member_id_key" UNIQUE ("member_id");



ALTER TABLE ONLY "public"."employee_storage"
    ADD CONSTRAINT "employee_storage_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."enterprise_quotes"
    ADD CONSTRAINT "enterprise_quotes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."environment_emp_actions"
    ADD CONSTRAINT "environment_emp_actions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."environment_facilities"
    ADD CONSTRAINT "environment_facilities_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."environment_flaring_logs"
    ADD CONSTRAINT "environment_flaring_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."environment_metrics"
    ADD CONSTRAINT "environment_metrics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."environment_monitoring_results"
    ADD CONSTRAINT "environment_monitoring_results_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."environment_obligations"
    ADD CONSTRAINT "environment_obligations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."environment_permits"
    ADD CONSTRAINT "environment_permits_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."environment_spill_reports"
    ADD CONSTRAINT "environment_spill_reports_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."environment_studies"
    ADD CONSTRAINT "environment_studies_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."environment_waste_manifests"
    ADD CONSTRAINT "environment_waste_manifests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."environmental_monitoring"
    ADD CONSTRAINT "environmental_monitoring_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."epe_capex"
    ADD CONSTRAINT "epe_capex_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."epe_cases"
    ADD CONSTRAINT "epe_cases_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."epe_opex"
    ADD CONSTRAINT "epe_opex_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."epe_production_volumes"
    ADD CONSTRAINT "epe_production_volumes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."epe_results"
    ADD CONSTRAINT "epe_results_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."epe_run_configs"
    ADD CONSTRAINT "epe_run_configs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."epe_runs"
    ADD CONSTRAINT "epe_runs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."epe_sensitivity_results"
    ADD CONSTRAINT "epe_sensitivity_results_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."epe_sensitivity_runs"
    ADD CONSTRAINT "epe_sensitivity_runs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."events"
    ADD CONSTRAINT "events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."expert_mode_sessions"
    ADD CONSTRAINT "expert_mode_sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."expert_mode_settings"
    ADD CONSTRAINT "expert_mode_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."facility_layouts"
    ADD CONSTRAINT "facility_layouts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."fdp_facilities"
    ADD CONSTRAINT "fdp_facilities_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."fdp_price_decks"
    ADD CONSTRAINT "fdp_price_decks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."fdp_projects"
    ADD CONSTRAINT "fdp_projects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."fdp_wells"
    ADD CONSTRAINT "fdp_wells_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."feature_flags"
    ADD CONSTRAINT "feature_flags_key_key" UNIQUE ("key");



ALTER TABLE ONLY "public"."feature_flags"
    ADD CONSTRAINT "feature_flags_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."feedback"
    ADD CONSTRAINT "feedback_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."fire_drills"
    ADD CONSTRAINT "fire_drills_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."fire_emergency_response_plans"
    ADD CONSTRAINT "fire_emergency_response_plans_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."fire_equipment_inventory"
    ADD CONSTRAINT "fire_equipment_inventory_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."fire_equipment_maintenance"
    ADD CONSTRAINT "fire_equipment_maintenance_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."fire_incident_investigation"
    ADD CONSTRAINT "fire_incident_investigation_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."fire_incidents"
    ADD CONSTRAINT "fire_incidents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."fire_safety_compliance"
    ADD CONSTRAINT "fire_safety_compliance_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."fire_safety_risks"
    ADD CONSTRAINT "fire_safety_risks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."fiscal_regime_projects"
    ADD CONSTRAINT "fiscal_regime_projects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."fitness_activities"
    ADD CONSTRAINT "fitness_activities_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."fitness_goals"
    ADD CONSTRAINT "fitness_goals_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."fitness_goals"
    ADD CONSTRAINT "fitness_goals_user_id_organization_id_key" UNIQUE ("user_id", "organization_id");



ALTER TABLE ONLY "public"."flow_assurance_projects"
    ADD CONSTRAINT "flow_assurance_projects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."flow_assurance_projects"
    ADD CONSTRAINT "flow_assurance_projects_user_id_project_name_key" UNIQUE ("user_id", "project_name");



ALTER TABLE ONLY "public"."fluid_studio_projects"
    ADD CONSTRAINT "fluid_studio_projects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."frac_completion_projects"
    ADD CONSTRAINT "frac_completion_projects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."frac_completion_projects"
    ADD CONSTRAINT "frac_completion_projects_user_id_project_name_key" UNIQUE ("user_id", "project_name");



ALTER TABLE ONLY "public"."frac_vault"
    ADD CONSTRAINT "frac_vault_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."geomech_measurements"
    ADD CONSTRAINT "geomech_measurements_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."geomech_params"
    ADD CONSTRAINT "geomech_params_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."geomech_velocity"
    ADD CONSTRAINT "geomech_velocity_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."geomechanics_projects"
    ADD CONSTRAINT "geomechanics_projects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."geomechanics_projects"
    ADD CONSTRAINT "geomechanics_projects_user_id_project_name_key" UNIQUE ("user_id", "project_name");



ALTER TABLE ONLY "public"."gm_curves"
    ADD CONSTRAINT "gm_curves_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."gm_datasets"
    ADD CONSTRAINT "gm_datasets_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."gm_events"
    ADD CONSTRAINT "gm_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."gm_models"
    ADD CONSTRAINT "gm_models_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."gm_run_points"
    ADD CONSTRAINT "gm_run_points_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."gm_runs"
    ADD CONSTRAINT "gm_runs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."gm_wells"
    ADD CONSTRAINT "gm_wells_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."hazard_assessments"
    ADD CONSTRAINT "hazard_assessments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."health_metrics"
    ADD CONSTRAINT "health_metrics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."health_profiles"
    ADD CONSTRAINT "health_profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."health_profiles"
    ADD CONSTRAINT "health_profiles_user_id_organization_id_key" UNIQUE ("user_id", "organization_id");



ALTER TABLE ONLY "public"."health_screenings"
    ADD CONSTRAINT "health_screenings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."help_articles"
    ADD CONSTRAINT "help_articles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."help_articles"
    ADD CONSTRAINT "help_articles_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."help_categories"
    ADD CONSTRAINT "help_categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."help_feedback"
    ADD CONSTRAINT "help_feedback_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."hydraulics_runs"
    ADD CONSTRAINT "hydraulics_runs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."incident_attachments"
    ADD CONSTRAINT "incident_attachments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."incident_comments"
    ADD CONSTRAINT "incident_comments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."incidents"
    ADD CONSTRAINT "incidents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."integration_audit_log"
    ADD CONSTRAINT "integration_audit_log_pkey" PRIMARY KEY ("log_id");



ALTER TABLE ONLY "public"."integration_connections"
    ADD CONSTRAINT "integration_connections_pkey" PRIMARY KEY ("connection_id");



ALTER TABLE ONLY "public"."integration_events"
    ADD CONSTRAINT "integration_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."integration_logs"
    ADD CONSTRAINT "integration_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."integration_snapshots"
    ADD CONSTRAINT "integration_snapshots_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."integration_sync_history"
    ADD CONSTRAINT "integration_sync_history_pkey" PRIMARY KEY ("sync_id");



ALTER TABLE ONLY "public"."integration_workflows"
    ADD CONSTRAINT "integration_workflows_pkey" PRIMARY KEY ("workflow_id");



ALTER TABLE ONLY "public"."invitations"
    ADD CONSTRAINT "invitations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."key_personnel"
    ADD CONSTRAINT "key_personnel_organization_id_role_key" UNIQUE ("organization_id", "role");



ALTER TABLE ONLY "public"."key_personnel"
    ADD CONSTRAINT "key_personnel_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."leaderboard_history"
    ADD CONSTRAINT "leaderboard_history_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."leaderboard_scores"
    ADD CONSTRAINT "leaderboard_scores_pkey" PRIMARY KEY ("user_id", "organization_id");



ALTER TABLE ONLY "public"."load_cases"
    ADD CONSTRAINT "load_cases_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."log_digitizer_projects"
    ADD CONSTRAINT "log_digitizer_projects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."log_facies_projects"
    ADD CONSTRAINT "log_facies_projects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."lookup_additives"
    ADD CONSTRAINT "lookup_additives_additive_name_key" UNIQUE ("additive_name");



ALTER TABLE ONLY "public"."lookup_additives"
    ADD CONSTRAINT "lookup_additives_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."lookup_casing_grades"
    ADD CONSTRAINT "lookup_casing_grades_grade_name_key" UNIQUE ("grade_name");



ALTER TABLE ONLY "public"."lookup_casing_grades"
    ADD CONSTRAINT "lookup_casing_grades_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."master_apps"
    ADD CONSTRAINT "master_apps_app_name_key" UNIQUE ("app_name");



ALTER TABLE ONLY "public"."master_apps"
    ADD CONSTRAINT "master_apps_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."medical_certifications"
    ADD CONSTRAINT "medical_certifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mem_activity_log"
    ADD CONSTRAINT "mem_activity_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mem_batch_jobs"
    ADD CONSTRAINT "mem_batch_jobs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mem_calculations"
    ADD CONSTRAINT "mem_calculations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mem_comments"
    ADD CONSTRAINT "mem_comments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mem_edge_function_jobs"
    ADD CONSTRAINT "mem_edge_function_jobs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mem_mechanical_properties"
    ADD CONSTRAINT "mem_mechanical_properties_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mem_pressure_data"
    ADD CONSTRAINT "mem_pressure_data_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mem_projects"
    ADD CONSTRAINT "mem_projects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mem_scenarios"
    ADD CONSTRAINT "mem_scenarios_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mem_team_access"
    ADD CONSTRAINT "mem_team_access_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mem_team_access"
    ADD CONSTRAINT "mem_team_access_well_id_user_id_key" UNIQUE ("well_id", "user_id");



ALTER TABLE ONLY "public"."mem_trajectories"
    ADD CONSTRAINT "mem_trajectories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mem_versions"
    ADD CONSTRAINT "mem_versions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mem_well_data"
    ADD CONSTRAINT "mem_well_data_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mem_well_logs"
    ADD CONSTRAINT "mem_well_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mem_wells"
    ADD CONSTRAINT "mem_wells_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mems"
    ADD CONSTRAINT "mems_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."mental_health_assessments"
    ADD CONSTRAINT "mental_health_assessments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."moc_actions"
    ADD CONSTRAINT "moc_actions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."moc_activity_log"
    ADD CONSTRAINT "moc_activity_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."moc_approvals"
    ADD CONSTRAINT "moc_approvals_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."moc_comments"
    ADD CONSTRAINT "moc_comments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."moc_impacts"
    ADD CONSTRAINT "moc_impacts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."moc_records"
    ADD CONSTRAINT "moc_records_org_id_moc_code_key" UNIQUE ("org_id", "moc_code");



ALTER TABLE ONLY "public"."moc_records"
    ADD CONSTRAINT "moc_records_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."moc_reviews"
    ADD CONSTRAINT "moc_reviews_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."model_training_logs"
    ADD CONSTRAINT "model_training_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."model_versions"
    ADD CONSTRAINT "model_versions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."module_access"
    ADD CONSTRAINT "module_access_organization_id_module_id_key" UNIQUE ("organization_id", "module_id");



ALTER TABLE ONLY "public"."module_access"
    ADD CONSTRAINT "module_access_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."modules"
    ADD CONSTRAINT "modules_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."modules"
    ADD CONSTRAINT "modules_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."modules"
    ADD CONSTRAINT "modules_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."mud_programs"
    ADD CONSTRAINT "mud_programs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."nextgen_registrations"
    ADD CONSTRAINT "nextgen_registrations_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."nextgen_registrations"
    ADD CONSTRAINT "nextgen_registrations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."offset_surveys"
    ADD CONSTRAINT "offset_surveys_offset_well_id_key" UNIQUE ("offset_well_id");



ALTER TABLE ONLY "public"."offset_surveys"
    ADD CONSTRAINT "offset_surveys_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."offset_wells"
    ADD CONSTRAINT "offset_wells_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."org_members"
    ADD CONSTRAINT "org_members_org_id_user_id_key" UNIQUE ("org_id", "user_id");



ALTER TABLE ONLY "public"."org_members"
    ADD CONSTRAINT "org_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."org_settings"
    ADD CONSTRAINT "org_settings_org_id_key" UNIQUE ("org_id");



ALTER TABLE ONLY "public"."org_settings"
    ADD CONSTRAINT "org_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organization_apps"
    ADD CONSTRAINT "organization_apps_organization_id_app_id_key" UNIQUE ("organization_id", "app_id");



ALTER TABLE ONLY "public"."organization_apps"
    ADD CONSTRAINT "organization_apps_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organization_assets"
    ADD CONSTRAINT "organization_assets_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organization_audit_logs"
    ADD CONSTRAINT "organization_audit_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organization_branding"
    ADD CONSTRAINT "organization_branding_org_id_key" UNIQUE ("organization_id");



ALTER TABLE ONLY "public"."organization_branding"
    ADD CONSTRAINT "organization_branding_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organization_members"
    ADD CONSTRAINT "organization_members_organization_id_email_key" UNIQUE ("organization_id", "email");



ALTER TABLE ONLY "public"."organization_members"
    ADD CONSTRAINT "organization_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organization_sites"
    ADD CONSTRAINT "organization_sites_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organization_sites"
    ADD CONSTRAINT "organization_sites_qr_token_key" UNIQUE ("qr_token");



ALTER TABLE ONLY "public"."organization_users"
    ADD CONSTRAINT "organization_users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payment_audit_log"
    ADD CONSTRAINT "payment_audit_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payment_methods"
    ADD CONSTRAINT "payment_methods_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payment_notifications"
    ADD CONSTRAINT "payment_notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_idempotency_key_key" UNIQUE ("idempotency_key");



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_paystack_reference_key" UNIQUE ("paystack_reference");



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."peer_review_audit"
    ADD CONSTRAINT "peer_review_audit_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."peer_review_comments"
    ADD CONSTRAINT "peer_review_comments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."peer_reviews"
    ADD CONSTRAINT "peer_reviews_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."permissions"
    ADD CONSTRAINT "permissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."permissions"
    ADD CONSTRAINT "permissions_resource_action_key" UNIQUE ("resource", "action");



ALTER TABLE ONLY "public"."permit_approvals"
    ADD CONSTRAINT "permit_approvals_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."permit_templates"
    ADD CONSTRAINT "permit_templates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."petrophysics_activity_log"
    ADD CONSTRAINT "petrophysics_activity_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."petrophysics_channels"
    ADD CONSTRAINT "petrophysics_channels_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."petrophysics_comments"
    ADD CONSTRAINT "petrophysics_comments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."petrophysics_correlation_lines"
    ADD CONSTRAINT "petrophysics_correlation_lines_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."petrophysics_curves"
    ADD CONSTRAINT "petrophysics_curves_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."petrophysics_markers"
    ADD CONSTRAINT "petrophysics_markers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."petrophysics_messages"
    ADD CONSTRAINT "petrophysics_messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."petrophysics_monte_carlo_runs"
    ADD CONSTRAINT "petrophysics_monte_carlo_runs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."petrophysics_notifications"
    ADD CONSTRAINT "petrophysics_notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."petrophysics_project_versions"
    ADD CONSTRAINT "petrophysics_project_versions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."petrophysics_projects"
    ADD CONSTRAINT "petrophysics_projects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."petrophysics_qc_reports"
    ADD CONSTRAINT "petrophysics_qc_reports_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."petrophysics_reserves"
    ADD CONSTRAINT "petrophysics_reserves_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."petrophysics_team_members"
    ADD CONSTRAINT "petrophysics_team_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."petrophysics_team_members"
    ADD CONSTRAINT "petrophysics_team_members_project_id_user_id_key" UNIQUE ("project_id", "user_id");



ALTER TABLE ONLY "public"."petrophysics_wells"
    ADD CONSTRAINT "petrophysics_wells_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."petrophysics_wiki_pages"
    ADD CONSTRAINT "petrophysics_wiki_pages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."petrophysics_wiki_pages"
    ADD CONSTRAINT "petrophysics_wiki_pages_project_id_slug_key" UNIQUE ("project_id", "slug");



ALTER TABLE ONLY "public"."phishing_results"
    ADD CONSTRAINT "phishing_results_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."phishing_simulations"
    ADD CONSTRAINT "phishing_simulations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pm_app_integrations"
    ADD CONSTRAINT "pm_app_integrations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pm_deliverables"
    ADD CONSTRAINT "pm_deliverables_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pm_integration_logs"
    ADD CONSTRAINT "pm_integration_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pm_integrations"
    ADD CONSTRAINT "pm_integrations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pm_integrations"
    ADD CONSTRAINT "pm_integrations_project_id_service_name_key" UNIQUE ("project_id", "service_name");



ALTER TABLE ONLY "public"."pm_resource_assignments"
    ADD CONSTRAINT "pm_resource_assignments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pm_resources"
    ADD CONSTRAINT "pm_resources_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."portfolio_projects"
    ADD CONSTRAINT "portfolio_projects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."portfolio_scenario_projects"
    ADD CONSTRAINT "portfolio_scenario_projects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."portfolio_scenario_projects"
    ADD CONSTRAINT "portfolio_scenario_projects_portfolio_id_project_id_key" UNIQUE ("portfolio_id", "project_id");



ALTER TABLE ONLY "public"."portfolio_snapshots"
    ADD CONSTRAINT "portfolio_snapshots_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."portfolios"
    ADD CONSTRAINT "portfolios_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."positions"
    ADD CONSTRAINT "positions_organization_id_name_key" UNIQUE ("organization_id", "name");



ALTER TABLE ONLY "public"."positions"
    ADD CONSTRAINT "positions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."predictions"
    ADD CONSTRAINT "predictions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."premium_subscriptions"
    ADD CONSTRAINT "premium_subscriptions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pressure_gradients"
    ADD CONSTRAINT "pressure_gradients_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pricing_config"
    ADD CONSTRAINT "pricing_config_key_key" UNIQUE ("key");



ALTER TABLE ONLY "public"."pricing_config"
    ADD CONSTRAINT "pricing_config_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pricing_tiers"
    ADD CONSTRAINT "pricing_tiers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."production_data"
    ADD CONSTRAINT "production_data_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."production_surveillance_projects"
    ADD CONSTRAINT "production_surveillance_projects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."project_issues"
    ADD CONSTRAINT "project_issues_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."project_members"
    ADD CONSTRAINT "project_members_pkey" PRIMARY KEY ("project_id", "user_id");



ALTER TABLE ONLY "public"."project_updates"
    ADD CONSTRAINT "project_updates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."property_overrides"
    ADD CONSTRAINT "property_overrides_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pta_files"
    ADD CONSTRAINT "pta_files_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pta_projects"
    ADD CONSTRAINT "pta_projects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pta_runs"
    ADD CONSTRAINT "pta_runs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pta_telemetry"
    ADD CONSTRAINT "pta_telemetry_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."purchased_apps"
    ADD CONSTRAINT "purchased_apps_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."purchased_modules"
    ADD CONSTRAINT "purchased_modules_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."pvt_results"
    ADD CONSTRAINT "pvt_results_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."quick_report_media"
    ADD CONSTRAINT "quick_report_media_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."quick_report_notifications"
    ADD CONSTRAINT "quick_report_notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."quick_reports"
    ADD CONSTRAINT "quick_reports_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."quickvol_activity_logs"
    ADD CONSTRAINT "quickvol_activity_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."quickvol_api_keys"
    ADD CONSTRAINT "quickvol_api_keys_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."quickvol_comments"
    ADD CONSTRAINT "quickvol_comments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."quickvol_generated_reports"
    ADD CONSTRAINT "quickvol_generated_reports_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."quickvol_integration_logs"
    ADD CONSTRAINT "quickvol_integration_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."quickvol_ml_models"
    ADD CONSTRAINT "quickvol_ml_models_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."quickvol_predictions"
    ADD CONSTRAINT "quickvol_predictions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."quickvol_report_templates"
    ADD CONSTRAINT "quickvol_report_templates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."quickvol_validation_runs"
    ADD CONSTRAINT "quickvol_validation_runs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."quickvol_versions"
    ADD CONSTRAINT "quickvol_versions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."quickvol_webhooks"
    ADD CONSTRAINT "quickvol_webhooks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."quickvol_workspace_members"
    ADD CONSTRAINT "quickvol_workspace_members_pkey" PRIMARY KEY ("workspace_id", "user_id");



ALTER TABLE ONLY "public"."quickvol_workspaces"
    ADD CONSTRAINT "quickvol_workspaces_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."quotes"
    ADD CONSTRAINT "quotes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."quotes"
    ADD CONSTRAINT "quotes_quote_id_key" UNIQUE ("quote_id");



ALTER TABLE ONLY "public"."quotes"
    ADD CONSTRAINT "quotes_quote_number_key" UNIQUE ("quote_number");



ALTER TABLE ONLY "public"."rb_cases"
    ADD CONSTRAINT "rb_cases_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."rb_production_data"
    ADD CONSTRAINT "rb_production_data_case_id_timestep_index_key" UNIQUE ("case_id", "timestep_index");



ALTER TABLE ONLY "public"."rb_production_data"
    ADD CONSTRAINT "rb_production_data_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."rb_results"
    ADD CONSTRAINT "rb_results_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."rb_results"
    ADD CONSTRAINT "rb_results_run_id_key" UNIQUE ("run_id");



ALTER TABLE ONLY "public"."rb_run_configs"
    ADD CONSTRAINT "rb_run_configs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."rb_runs"
    ADD CONSTRAINT "rb_runs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."recommendations"
    ADD CONSTRAINT "recommendations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."regulatory_authorities"
    ADD CONSTRAINT "regulatory_authorities_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."regulatory_obligations"
    ADD CONSTRAINT "regulatory_obligations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."renewal_audit_log"
    ADD CONSTRAINT "renewal_audit_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."renewal_notifications"
    ADD CONSTRAINT "renewal_notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."renewal_reminders"
    ADD CONSTRAINT "renewal_reminders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."report_shares"
    ADD CONSTRAINT "report_shares_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reports"
    ADD CONSTRAINT "reports_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reservoir_activities"
    ADD CONSTRAINT "reservoir_activities_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reservoir_analyses"
    ADD CONSTRAINT "reservoir_analyses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reservoircalc_projects"
    ADD CONSTRAINT "reservoircalc_projects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reservoirs"
    ADD CONSTRAINT "reservoirs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."resources"
    ADD CONSTRAINT "resources_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."retraining_jobs"
    ADD CONSTRAINT "retraining_jobs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."return_to_work_plans"
    ADD CONSTRAINT "return_to_work_plans_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."risk_actions"
    ADD CONSTRAINT "risk_actions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."risk_activity_log"
    ADD CONSTRAINT "risk_activity_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."risk_attachments"
    ADD CONSTRAINT "risk_attachments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."risk_comments"
    ADD CONSTRAINT "risk_comments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."risk_kris"
    ADD CONSTRAINT "risk_kris_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."risk_links"
    ADD CONSTRAINT "risk_links_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."risk_mitigation_actions"
    ADD CONSTRAINT "risk_mitigation_actions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."risk_register"
    ADD CONSTRAINT "risk_register_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."risk_register_snapshots"
    ADD CONSTRAINT "risk_register_snapshots_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."risk_reviews"
    ADD CONSTRAINT "risk_reviews_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."risk_scenarios"
    ADD CONSTRAINT "risk_scenarios_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."risk_tags"
    ADD CONSTRAINT "risk_tags_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."risks"
    ADD CONSTRAINT "risks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."role_permissions"
    ADD CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("role_id", "permission_id");



ALTER TABLE ONLY "public"."roles"
    ADD CONSTRAINT "roles_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."roles"
    ADD CONSTRAINT "roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."rto_connections"
    ADD CONSTRAINT "rto_connections_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."rto_projects"
    ADD CONSTRAINT "rto_projects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."rto_projects"
    ADD CONSTRAINT "rto_projects_user_id_project_name_key" UNIQUE ("user_id", "project_name");



ALTER TABLE ONLY "public"."rto_settings"
    ADD CONSTRAINT "rto_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."safety_audits"
    ADD CONSTRAINT "safety_audits_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."safety_moment_categories"
    ADD CONSTRAINT "safety_moment_categories_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."safety_moment_categories"
    ADD CONSTRAINT "safety_moment_categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."safety_moment_downloads"
    ADD CONSTRAINT "safety_moment_downloads_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."safety_moment_shares"
    ADD CONSTRAINT "safety_moment_shares_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."safety_moment_views"
    ADD CONSTRAINT "safety_moment_views_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."safety_moments"
    ADD CONSTRAINT "safety_moments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."safety_points"
    ADD CONSTRAINT "safety_points_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."safety_scores"
    ADD CONSTRAINT "safety_scores_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."saved_casing_design_projects"
    ADD CONSTRAINT "saved_casing_design_projects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."saved_compressor_pump_projects"
    ADD CONSTRAINT "saved_compressor_pump_projects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."saved_dca_projects"
    ADD CONSTRAINT "saved_dca_projects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."saved_drilling_fluids_projects"
    ADD CONSTRAINT "saved_drilling_fluids_projects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."saved_heat_exchanger_projects"
    ADD CONSTRAINT "saved_heat_exchanger_projects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."saved_mbal_projects"
    ADD CONSTRAINT "saved_mbal_projects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."saved_nodal_analysis_projects"
    ADD CONSTRAINT "saved_nodal_analysis_projects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."saved_petrophysics_projects"
    ADD CONSTRAINT "saved_petrophysics_projects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."saved_pipeline_sizer_projects"
    ADD CONSTRAINT "saved_pipeline_sizer_projects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."saved_pvt_projects"
    ADD CONSTRAINT "saved_pvt_projects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."saved_quickvol_projects"
    ADD CONSTRAINT "saved_quickvol_projects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."saved_relief_projects"
    ADD CONSTRAINT "saved_relief_projects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."saved_report_autopilot_projects"
    ADD CONSTRAINT "saved_report_autopilot_projects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."saved_reports"
    ADD CONSTRAINT "saved_reports_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."saved_reservoir_balance_projects"
    ADD CONSTRAINT "saved_reservoir_balance_projects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."saved_well_cost_iq_projects"
    ADD CONSTRAINT "saved_well_cost_iq_projects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."saved_well_cost_projects"
    ADD CONSTRAINT "saved_well_cost_projects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."scenario_comparisons"
    ADD CONSTRAINT "scenario_comparisons_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."scheduled_safety_moments"
    ADD CONSTRAINT "scheduled_safety_moments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."security_incidents"
    ADD CONSTRAINT "security_incidents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."security_knowledge_assessments"
    ADD CONSTRAINT "security_knowledge_assessments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."security_profiles"
    ADD CONSTRAINT "security_profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."security_profiles"
    ADD CONSTRAINT "security_profiles_user_id_organization_id_key" UNIQUE ("user_id", "organization_id");



ALTER TABLE ONLY "public"."security_training"
    ADD CONSTRAINT "security_training_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."shared_data_registry"
    ADD CONSTRAINT "shared_data_registry_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sim_cases"
    ADD CONSTRAINT "sim_cases_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sim_projects"
    ADD CONSTRAINT "sim_projects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sip_faults"
    ADD CONSTRAINT "sip_faults_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sip_horizons"
    ADD CONSTRAINT "sip_horizons_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sip_jobs"
    ADD CONSTRAINT "sip_jobs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sip_projects"
    ADD CONSTRAINT "sip_projects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sip_surveys"
    ADD CONSTRAINT "sip_surveys_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sip_uploads"
    ADD CONSTRAINT "sip_uploads_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sip_uploads"
    ADD CONSTRAINT "sip_uploads_survey_id_file_hash_key" UNIQUE ("survey_id", "file_hash");



ALTER TABLE ONLY "public"."sip_versions"
    ADD CONSTRAINT "sip_versions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sip_volumes"
    ADD CONSTRAINT "sip_volumes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sip_workspaces"
    ADD CONSTRAINT "sip_workspaces_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."site_locations"
    ADD CONSTRAINT "site_locations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."sites"
    ADD CONSTRAINT "sites_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ss_assets"
    ADD CONSTRAINT "ss_assets_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ss_events"
    ADD CONSTRAINT "ss_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ss_interpretations"
    ADD CONSTRAINT "ss_interpretations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ss_jobs"
    ADD CONSTRAINT "ss_jobs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ss_projects"
    ADD CONSTRAINT "ss_projects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ss_sections"
    ADD CONSTRAINT "ss_sections_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ss_styles"
    ADD CONSTRAINT "ss_styles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ss_versions"
    ADD CONSTRAINT "ss_versions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ss_volumes"
    ADD CONSTRAINT "ss_volumes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ss_workflow_runs"
    ADD CONSTRAINT "ss_workflow_runs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ss_workflows"
    ADD CONSTRAINT "ss_workflows_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."stress_overrides"
    ADD CONSTRAINT "stress_overrides_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."studio_access_tokens"
    ADD CONSTRAINT "studio_access_tokens_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."studio_access_tokens"
    ADD CONSTRAINT "studio_access_tokens_token_key" UNIQUE ("token");



ALTER TABLE ONLY "public"."studio_users"
    ADD CONSTRAINT "studio_users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."subscription_events"
    ADD CONSTRAINT "subscription_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."subscription_modules"
    ADD CONSTRAINT "subscription_modules_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."subscription_modules"
    ADD CONSTRAINT "subscription_modules_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."subscription_usage"
    ADD CONSTRAINT "subscription_usage_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."super_admin_impersonation_log"
    ADD CONSTRAINT "super_admin_impersonation_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."support_ticket_comments"
    ADD CONSTRAINT "support_ticket_comments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."support_tickets"
    ADD CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."surveys"
    ADD CONSTRAINT "surveys_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."surveys"
    ADD CONSTRAINT "surveys_well_id_key" UNIQUE ("well_id");



ALTER TABLE ONLY "public"."system_settings"
    ADD CONSTRAINT "system_settings_key_key" UNIQUE ("key");



ALTER TABLE ONLY "public"."system_settings"
    ADD CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tasks"
    ADD CONSTRAINT "tasks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."team_app_access"
    ADD CONSTRAINT "team_app_access_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."team_app_access"
    ADD CONSTRAINT "team_app_access_team_id_app_id_key" UNIQUE ("team_id", "app_id");



ALTER TABLE ONLY "public"."team_members"
    ADD CONSTRAINT "team_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."team_members"
    ADD CONSTRAINT "team_members_team_id_user_id_key" UNIQUE ("team_id", "user_id");



ALTER TABLE ONLY "public"."teams"
    ADD CONSTRAINT "teams_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."template_usage"
    ADD CONSTRAINT "template_usage_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."templates"
    ADD CONSTRAINT "templates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tenants"
    ADD CONSTRAINT "tenants_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."torque_drag_projects"
    ADD CONSTRAINT "torque_drag_projects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."torque_drag_projects"
    ADD CONSTRAINT "torque_drag_projects_user_id_project_name_key" UNIQUE ("user_id", "project_name");



ALTER TABLE ONLY "public"."torque_drag_runs"
    ADD CONSTRAINT "torque_drag_runs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."trajectory_plans"
    ADD CONSTRAINT "trajectory_plans_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."trend_analysis"
    ADD CONSTRAINT "trend_analysis_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tubular_grades"
    ADD CONSTRAINT "tubular_grades_grade_od_in_weight_lbft_key" UNIQUE ("grade", "od_in", "weight_lbft");



ALTER TABLE ONLY "public"."tubular_grades"
    ADD CONSTRAINT "tubular_grades_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."access_requests"
    ADD CONSTRAINT "unique_pending_request" UNIQUE ("member_id", "app_id", "status");



ALTER TABLE ONLY "public"."mem_wells"
    ADD CONSTRAINT "unique_well_name_per_user" UNIQUE ("user_id", "well_name");



ALTER TABLE ONLY "public"."usage_metrics"
    ADD CONSTRAINT "usage_metrics_organization_id_period_start_key" UNIQUE ("organization_id", "period_start");



ALTER TABLE ONLY "public"."usage_metrics"
    ADD CONSTRAINT "usage_metrics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_activity_logs"
    ADD CONSTRAINT "user_activity_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_app_access"
    ADD CONSTRAINT "user_app_access_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_app_access"
    ADD CONSTRAINT "user_app_access_user_id_app_name_key" UNIQUE ("user_id", "app_name");



ALTER TABLE ONLY "public"."user_badges"
    ADD CONSTRAINT "user_badges_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_badges"
    ADD CONSTRAINT "user_badges_user_id_organization_id_badge_id_key" UNIQUE ("user_id", "organization_id", "badge_id");



ALTER TABLE ONLY "public"."user_currency_preference"
    ADD CONSTRAINT "user_currency_preference_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."user_notifications"
    ADD CONSTRAINT "user_notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_points_summary"
    ADD CONSTRAINT "user_points_summary_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_points_summary"
    ADD CONSTRAINT "user_points_summary_user_id_organization_id_key" UNIQUE ("user_id", "organization_id");



ALTER TABLE ONLY "public"."user_positions"
    ADD CONSTRAINT "user_positions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_positions"
    ADD CONSTRAINT "user_positions_user_id_organization_id_position_id_key" UNIQUE ("user_id", "organization_id", "position_id");



ALTER TABLE ONLY "public"."user_preferences"
    ADD CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_saved_moments"
    ADD CONSTRAINT "user_saved_moments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_saved_moments"
    ADD CONSTRAINT "user_saved_moments_user_id_moment_id_key" UNIQUE ("user_id", "moment_id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."vulnerabilities"
    ADD CONSTRAINT "vulnerabilities_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."waterflood_projects"
    ADD CONSTRAINT "waterflood_projects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."webhooks"
    ADD CONSTRAINT "webhooks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."well_correlation_projects"
    ADD CONSTRAINT "well_correlation_projects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."well_correlation_wells"
    ADD CONSTRAINT "well_correlation_wells_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."well_targets"
    ADD CONSTRAINT "well_targets_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."wellbore_flow_projects"
    ADD CONSTRAINT "wellbore_flow_projects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."wellbore_flow_projects"
    ADD CONSTRAINT "wellbore_flow_projects_user_id_project_name_key" UNIQUE ("user_id", "project_name");



ALTER TABLE ONLY "public"."wells"
    ADD CONSTRAINT "wells_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."work_permits"
    ADD CONSTRAINT "work_permits_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."workflow_executions"
    ADD CONSTRAINT "workflow_executions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."workflow_steps"
    ADD CONSTRAINT "workflow_steps_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."workflows"
    ADD CONSTRAINT "workflows_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_actions_assigned" ON "hse"."actions" USING "btree" ("assigned_to");



CREATE INDEX "idx_actions_org" ON "hse"."actions" USING "btree" ("organization_id");



CREATE INDEX "idx_audit_log_created_at" ON "hse"."audit_log" USING "btree" ("created_at");



CREATE INDEX "idx_audit_log_organization_id" ON "hse"."audit_log" USING "btree" ("organization_id");



CREATE INDEX "idx_reports_org" ON "hse"."reports" USING "btree" ("organization_id");



CREATE INDEX "idx_reports_type" ON "hse"."reports" USING "btree" ("report_type");



CREATE INDEX "idx_subscriptions_organization_id" ON "hse"."subscriptions" USING "btree" ("organization_id");



CREATE INDEX "artificial_lift_designs_created_idx" ON "public"."artificial_lift_designs" USING "btree" ("created_at");



CREATE INDEX "artificial_lift_designs_user_idx" ON "public"."artificial_lift_designs" USING "btree" ("user_id");



CREATE UNIQUE INDEX "artificial_lift_designs_user_name_idx" ON "public"."artificial_lift_designs" USING "btree" ("user_id", "design_name");



CREATE INDEX "drilling_incidents_embedding_idx" ON "public"."drilling_incidents" USING "hnsw" ("embedding" "public"."vector_cosine_ops");



CREATE UNIQUE INDEX "geomech_velocity_well_id_tvd_m_key" ON "public"."geomech_velocity" USING "btree" ("well_id", "tvd_m");



CREATE INDEX "idx_activity_log_well_id" ON "public"."mem_activity_log" USING "btree" ("well_id");



CREATE INDEX "idx_annuli_casing_string_id" ON "public"."annuli" USING "btree" ("casing_string_id");



CREATE INDEX "idx_annuli_well_id" ON "public"."annuli" USING "btree" ("well_id");



CREATE INDEX "idx_app_activity_log_user_timestamp" ON "public"."app_activity_log" USING "btree" ("user_id", "timestamp" DESC);



CREATE INDEX "idx_audit_logs_actor" ON "public"."organization_audit_logs" USING "btree" ("actor_id");



CREATE INDEX "idx_audit_logs_org_created" ON "public"."organization_audit_logs" USING "btree" ("organization_id", "created_at" DESC);



CREATE INDEX "idx_batch_jobs_status" ON "public"."mem_batch_jobs" USING "btree" ("status");



CREATE INDEX "idx_batch_jobs_user_id" ON "public"."mem_batch_jobs" USING "btree" ("user_id");



CREATE INDEX "idx_bulk_import_org" ON "public"."bulk_import_jobs" USING "btree" ("organization_id");



CREATE INDEX "idx_calc_runs_case_id" ON "public"."calc_runs" USING "btree" ("case_id");



CREATE INDEX "idx_calc_runs_casing_string_id" ON "public"."calc_runs" USING "btree" ("casing_string_id");



CREATE INDEX "idx_calc_runs_well_id" ON "public"."calc_runs" USING "btree" ("well_id");



CREATE INDEX "idx_casing_strings_well_id" ON "public"."casing_strings" USING "btree" ("well_id");



CREATE INDEX "idx_doc_revisions_doc_id" ON "public"."doc_revisions" USING "btree" ("document_id");



CREATE INDEX "idx_doc_workflows_reviewer" ON "public"."doc_workflows" USING "btree" ("reviewer_id");



CREATE INDEX "idx_documents_dept" ON "public"."documents" USING "btree" ("department");



CREATE INDEX "idx_documents_org_id" ON "public"."documents" USING "btree" ("org_id");



CREATE INDEX "idx_documents_status" ON "public"."documents" USING "btree" ("status");



CREATE INDEX "idx_emp_app_access_member" ON "public"."employee_app_access" USING "btree" ("member_id");



CREATE INDEX "idx_emp_app_access_org" ON "public"."employee_app_access" USING "btree" ("organization_id");



CREATE INDEX "idx_epe_run_configs_case_id" ON "public"."epe_run_configs" USING "btree" ("case_id");



CREATE INDEX "idx_epe_run_configs_user_id" ON "public"."epe_run_configs" USING "btree" ("user_id");



CREATE INDEX "idx_epe_runs_run_config_id" ON "public"."epe_runs" USING "btree" ("run_config_id");



CREATE INDEX "idx_gm_curves_dataset_mnemonic" ON "public"."gm_curves" USING "btree" ("dataset_id", "mnemonic");



CREATE INDEX "idx_gm_events_well_md" ON "public"."gm_events" USING "btree" ("well_id", "md_ft");



CREATE INDEX "idx_gm_run_points_run_tvd" ON "public"."gm_run_points" USING "btree" ("run_id", "tvd_ft");



CREATE INDEX "idx_impersonation_log_created_at" ON "public"."super_admin_impersonation_log" USING "btree" ("created_at");



CREATE INDEX "idx_impersonation_log_super_admin" ON "public"."super_admin_impersonation_log" USING "btree" ("super_admin_id");



CREATE INDEX "idx_load_cases_casing_string_id" ON "public"."load_cases" USING "btree" ("casing_string_id");



CREATE INDEX "idx_logs_action" ON "public"."user_activity_logs" USING "btree" ("action");



CREATE INDEX "idx_logs_org" ON "public"."user_activity_logs" USING "btree" ("organization_id");



CREATE INDEX "idx_logs_super_admin" ON "public"."user_activity_logs" USING "btree" ("super_admin_id");



CREATE INDEX "idx_logs_timestamp" ON "public"."user_activity_logs" USING "btree" ("timestamp");



CREATE INDEX "idx_master_apps_module_id" ON "public"."master_apps" USING "btree" ("module_id");



CREATE UNIQUE INDEX "idx_master_apps_module_name" ON "public"."master_apps" USING "btree" ("module", "app_name");



CREATE INDEX "idx_mems_status" ON "public"."mems" USING "btree" ("status");



CREATE INDEX "idx_mems_well_id" ON "public"."mems" USING "btree" ("well_id");



CREATE INDEX "idx_org_members_email" ON "public"."organization_members" USING "btree" ("email");



CREATE INDEX "idx_org_members_org_id" ON "public"."organization_members" USING "btree" ("organization_id");



CREATE INDEX "idx_org_members_token" ON "public"."organization_members" USING "btree" ("invitation_token");



CREATE UNIQUE INDEX "idx_org_users_org_user_unique" ON "public"."organization_users" USING "btree" ("organization_id", "user_id");



CREATE INDEX "idx_organization_apps_org_id" ON "public"."organization_apps" USING "btree" ("organization_id");



CREATE INDEX "idx_organization_sites_qr_token" ON "public"."organization_sites" USING "btree" ("qr_token") WHERE ("qr_enabled" = true);



CREATE INDEX "idx_organizations_app_type" ON "public"."organizations" USING "btree" ("app_type_legacy");



CREATE INDEX "idx_organizations_subscribed_modules" ON "public"."organizations" USING "gin" ("subscribed_modules_legacy");



CREATE INDEX "idx_organizations_subscription_status" ON "public"."organizations" USING "btree" ("subscription_status");



CREATE INDEX "idx_orgs_hse_enabled" ON "public"."organizations" USING "btree" ("hse_enabled_legacy");



CREATE INDEX "idx_pm_deliverables_project" ON "public"."pm_deliverables" USING "btree" ("project_id");



CREATE INDEX "idx_pm_integrations_project" ON "public"."pm_app_integrations" USING "btree" ("project_id");



CREATE INDEX "idx_pm_logs_project" ON "public"."pm_integration_logs" USING "btree" ("project_id");



CREATE INDEX "idx_pm_resource_assignments_resource_id" ON "public"."pm_resource_assignments" USING "btree" ("resource_id");



CREATE INDEX "idx_pm_resource_assignments_task_id" ON "public"."pm_resource_assignments" USING "btree" ("task_id");



CREATE INDEX "idx_pm_resources_project_id" ON "public"."pm_resources" USING "btree" ("project_id");



CREATE INDEX "idx_purchased_modules_app_uuid" ON "public"."purchased_modules" USING "btree" ("app_uuid");



CREATE INDEX "idx_purchased_modules_module_uuid" ON "public"."purchased_modules" USING "btree" ("module_uuid");



CREATE INDEX "idx_purchased_modules_org" ON "public"."purchased_modules" USING "btree" ("organization_id");



CREATE INDEX "idx_quick_reports_department_id" ON "public"."quick_reports" USING "btree" ("department_id");



CREATE INDEX "idx_quick_reports_investigation_completed" ON "public"."quick_reports" USING "btree" ("investigation_completed_at") WHERE ("investigation_completed_at" IS NOT NULL);



CREATE INDEX "idx_quick_reports_site_id" ON "public"."quick_reports" USING "btree" ("site_id");



CREATE INDEX "idx_quotes_org_id" ON "public"."quotes" USING "btree" ("organization_id");



CREATE INDEX "idx_quotes_organization_id" ON "public"."quotes" USING "btree" ("organization_id");



CREATE INDEX "idx_quotes_status" ON "public"."quotes" USING "btree" ("status");



CREATE INDEX "idx_quotes_user_id" ON "public"."quotes" USING "btree" ("user_id");



CREATE INDEX "idx_rb_cases_active" ON "public"."rb_cases" USING "btree" ("user_id", "updated_at" DESC) WHERE ("archived_at" IS NULL);



CREATE INDEX "idx_rb_cases_org_id" ON "public"."rb_cases" USING "btree" ("org_id") WHERE ("org_id" IS NOT NULL);



CREATE INDEX "idx_rb_cases_user_id" ON "public"."rb_cases" USING "btree" ("user_id");



CREATE INDEX "idx_rb_production_data_case_timestep" ON "public"."rb_production_data" USING "btree" ("case_id", "timestep_index");



CREATE INDEX "idx_rb_results_case_id" ON "public"."rb_results" USING "btree" ("case_id");



CREATE INDEX "idx_rb_results_run_id" ON "public"."rb_results" USING "btree" ("run_id");



CREATE INDEX "idx_rb_run_configs_case_id" ON "public"."rb_run_configs" USING "btree" ("case_id");



CREATE INDEX "idx_rb_run_configs_scenarios" ON "public"."rb_run_configs" USING "btree" ("case_id") WHERE ("is_scenario" = true);



CREATE INDEX "idx_rb_runs_case_id" ON "public"."rb_runs" USING "btree" ("case_id", "started_at" DESC);



CREATE INDEX "idx_rb_runs_status" ON "public"."rb_runs" USING "btree" ("status") WHERE ("status" = ANY (ARRAY['pending'::"text", 'running'::"text"]));



CREATE INDEX "idx_sensitivity_results_ordinal" ON "public"."epe_sensitivity_results" USING "btree" ("sensitivity_run_id", "ordinal");



CREATE INDEX "idx_sensitivity_results_run" ON "public"."epe_sensitivity_results" USING "btree" ("sensitivity_run_id");



CREATE INDEX "idx_sensitivity_runs_base_run" ON "public"."epe_sensitivity_runs" USING "btree" ("base_run_id");



CREATE INDEX "idx_sensitivity_runs_user" ON "public"."epe_sensitivity_runs" USING "btree" ("user_id");



CREATE INDEX "idx_sip_faults_meta_gin" ON "public"."sip_faults" USING "gin" ("metadata_jsonb");



CREATE INDEX "idx_sip_faults_version" ON "public"."sip_faults" USING "btree" ("version_id");



CREATE INDEX "idx_sip_faults_volume" ON "public"."sip_faults" USING "btree" ("volume_id");



CREATE INDEX "idx_sip_horizons_meta_gin" ON "public"."sip_horizons" USING "gin" ("metadata_jsonb");



CREATE INDEX "idx_sip_horizons_version" ON "public"."sip_horizons" USING "btree" ("version_id");



CREATE INDEX "idx_sip_horizons_volume" ON "public"."sip_horizons" USING "btree" ("volume_id");



CREATE INDEX "idx_sip_jobs_created_at" ON "public"."sip_jobs" USING "btree" ("created_at");



CREATE INDEX "idx_sip_jobs_input_gin" ON "public"."sip_jobs" USING "gin" ("input_jsonb");



CREATE INDEX "idx_sip_jobs_output_gin" ON "public"."sip_jobs" USING "gin" ("output_jsonb");



CREATE INDEX "idx_sip_jobs_proj" ON "public"."sip_jobs" USING "btree" ("project_id");



CREATE INDEX "idx_sip_jobs_status" ON "public"."sip_jobs" USING "btree" ("status");



CREATE INDEX "idx_sip_projects_org" ON "public"."sip_projects" USING "btree" ("organization_id");



CREATE INDEX "idx_sip_surveys_meta_gin" ON "public"."sip_surveys" USING "gin" ("metadata_jsonb");



CREATE INDEX "idx_sip_surveys_proj" ON "public"."sip_surveys" USING "btree" ("project_id");



CREATE INDEX "idx_sip_uploads_hash" ON "public"."sip_uploads" USING "btree" ("file_hash");



CREATE INDEX "idx_sip_uploads_survey" ON "public"."sip_uploads" USING "btree" ("survey_id");



CREATE INDEX "idx_sip_versions_workspace" ON "public"."sip_versions" USING "btree" ("workspace_id");



CREATE INDEX "idx_sip_volumes_stats_gin" ON "public"."sip_volumes" USING "gin" ("stats_jsonb");



CREATE INDEX "idx_sip_volumes_survey" ON "public"."sip_volumes" USING "btree" ("survey_id");



CREATE INDEX "idx_sip_workspaces_proj" ON "public"."sip_workspaces" USING "btree" ("project_id");



CREATE INDEX "idx_ss_interps_project" ON "public"."ss_interpretations" USING "btree" ("project_id");



CREATE INDEX "idx_ss_interps_section" ON "public"."ss_interpretations" USING "btree" ("section_id");



CREATE INDEX "idx_ss_jobs_project" ON "public"."ss_jobs" USING "btree" ("project_id");



CREATE INDEX "idx_ss_jobs_status" ON "public"."ss_jobs" USING "btree" ("status");



CREATE INDEX "idx_ss_sections_volume" ON "public"."ss_sections" USING "btree" ("volume_id");



CREATE INDEX "idx_ss_volumes_project" ON "public"."ss_volumes" USING "btree" ("project_id");



CREATE INDEX "idx_studio_access_tokens_is_active" ON "public"."studio_access_tokens" USING "btree" ("is_active");



CREATE INDEX "idx_studio_access_tokens_user_id" ON "public"."studio_access_tokens" USING "btree" ("studio_user_id");



CREATE INDEX "idx_studio_users_is_active" ON "public"."studio_users" USING "btree" ("is_active");



CREATE INDEX "idx_studio_users_role" ON "public"."studio_users" USING "btree" ("role");



CREATE INDEX "idx_subscriptions_org_id" ON "public"."subscriptions" USING "btree" ("organization_id");



CREATE INDEX "idx_subscriptions_org_status" ON "public"."subscriptions" USING "btree" ("organization_id", "status");



CREATE INDEX "idx_team_access_well_id_user_id" ON "public"."mem_team_access" USING "btree" ("well_id", "user_id");



CREATE INDEX "idx_team_members_team" ON "public"."team_members" USING "btree" ("team_id");



CREATE INDEX "idx_team_members_user" ON "public"."team_members" USING "btree" ("user_id");



CREATE INDEX "idx_teams_org" ON "public"."teams" USING "btree" ("organization_id");



CREATE INDEX "idx_user_app_access_user_app" ON "public"."user_app_access" USING "btree" ("user_id", "app_name");



CREATE INDEX "idx_user_notifications_is_read" ON "public"."user_notifications" USING "btree" ("is_read");



CREATE INDEX "idx_user_notifications_user_id" ON "public"."user_notifications" USING "btree" ("user_id");



CREATE UNIQUE INDEX "idx_user_points_summary_user_id" ON "public"."user_points_summary" USING "btree" ("user_id");



CREATE UNIQUE INDEX "idx_user_points_user_unique" ON "public"."user_points_summary" USING "btree" ("user_id");



CREATE INDEX "idx_users_last_accessed_app" ON "public"."users" USING "btree" ("last_accessed_app");



CREATE INDEX "idx_users_primary_app" ON "public"."users" USING "btree" ("primary_app");



CREATE INDEX "idx_users_subscribed_modules" ON "public"."users" USING "gin" ("subscribed_modules");



CREATE INDEX "idx_well_data_well_id" ON "public"."mem_well_data" USING "btree" ("well_id");



CREATE INDEX "idx_wells_user_id" ON "public"."mem_wells" USING "btree" ("user_id");



CREATE UNIQUE INDEX "pressure_gradients_well_id_md_m_unique_idx" ON "public"."pressure_gradients" USING "btree" ("well_id", "md_m");



CREATE UNIQUE INDEX "rto_settings_well_id_key" ON "public"."rto_settings" USING "btree" ("well_id");



CREATE OR REPLACE TRIGGER "trigger_generate_action_code" BEFORE INSERT ON "hse"."actions" FOR EACH ROW EXECUTE FUNCTION "hse"."generate_action_code"();



CREATE OR REPLACE TRIGGER "create_user_points_summary" AFTER INSERT ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "public"."handle_new_user_profile"();



CREATE OR REPLACE TRIGGER "handle_updated_at_bf_jobs" BEFORE UPDATE ON "public"."bf_jobs" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "handle_updated_at_bf_wells" BEFORE UPDATE ON "public"."bf_wells" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "handle_updated_at_econ_fiscal_terms" BEFORE UPDATE ON "public"."econ_fiscal_terms" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "handle_updated_at_econ_inputs" BEFORE UPDATE ON "public"."econ_inputs" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "handle_updated_at_econ_line_items" BEFORE UPDATE ON "public"."econ_line_items" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "handle_updated_at_econ_models" BEFORE UPDATE ON "public"."econ_models" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "handle_updated_at_econ_models_v2" BEFORE UPDATE ON "public"."econ_models_v2" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "handle_updated_at_econ_projects" BEFORE UPDATE ON "public"."econ_projects" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "handle_updated_at_econ_scenarios" BEFORE UPDATE ON "public"."econ_scenarios" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "handle_updated_at_econ_scenarios_v2" BEFORE UPDATE ON "public"."econ_scenarios_v2" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "handle_updated_at_mem_edge_function_jobs" BEFORE UPDATE ON "public"."mem_edge_function_jobs" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "handle_updated_at_mem_mechanical_properties" BEFORE UPDATE ON "public"."mem_mechanical_properties" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "handle_updated_at_mem_pressure_data" BEFORE UPDATE ON "public"."mem_pressure_data" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "handle_updated_at_mem_projects" BEFORE UPDATE ON "public"."mem_projects" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "on_subscription_change" AFTER INSERT OR UPDATE OF "modules" ON "public"."subscriptions" FOR EACH ROW EXECUTE FUNCTION "public"."calculate_subscription_tier"();



CREATE OR REPLACE TRIGGER "prevent_org_members_write" BEFORE INSERT OR UPDATE ON "public"."org_members" FOR EACH ROW EXECUTE FUNCTION "public"."block_org_members_writes"();



CREATE OR REPLACE TRIGGER "prevent_org_users_write" BEFORE INSERT OR UPDATE ON "public"."organization_users" FOR EACH ROW EXECUTE FUNCTION "public"."block_organization_users_writes"();



CREATE OR REPLACE TRIGGER "set_mem_batch_jobs_updated_at" BEFORE UPDATE ON "public"."mem_batch_jobs" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_mem_comments_updated_at" BEFORE UPDATE ON "public"."mem_comments" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_mem_wells_updated_at" BEFORE UPDATE ON "public"."mem_wells" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_mems_updated_at" BEFORE UPDATE ON "public"."mems" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "set_updated_at_master_apps" BEFORE UPDATE ON "public"."master_apps" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at_master_apps"();



CREATE OR REPLACE TRIGGER "trg_ss_interpretations_updated" BEFORE UPDATE ON "public"."ss_interpretations" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_ss_jobs_updated" BEFORE UPDATE ON "public"."ss_jobs" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_ss_sections_updated" BEFORE UPDATE ON "public"."ss_sections" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_ss_volumes_updated" BEFORE UPDATE ON "public"."ss_volumes" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trg_studio_users_updated_at" BEFORE UPDATE ON "public"."studio_users" FOR EACH ROW EXECUTE FUNCTION "public"."set_updated_at"();



CREATE OR REPLACE TRIGGER "trigger_generate_permit_number" BEFORE INSERT ON "public"."work_permits" FOR EACH ROW WHEN (("new"."permit_number" IS NULL)) EXECUTE FUNCTION "public"."generate_permit_number"();



CREATE OR REPLACE TRIGGER "trigger_update_subscription_tier" AFTER INSERT OR UPDATE ON "public"."subscriptions" FOR EACH ROW EXECUTE FUNCTION "public"."update_subscription_tier"();



CREATE OR REPLACE TRIGGER "update_rb_cases_updated_at" BEFORE UPDATE ON "public"."rb_cases" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_rb_run_configs_updated_at" BEFORE UPDATE ON "public"."rb_run_configs" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_usage_metrics_timestamp" BEFORE UPDATE ON "public"."usage_metrics" FOR EACH ROW EXECUTE FUNCTION "public"."update_usage_metrics_timestamp"();



ALTER TABLE ONLY "hse"."access_logs"
    ADD CONSTRAINT "access_logs_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "hse"."access_logs"
    ADD CONSTRAINT "access_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "hse"."actions"
    ADD CONSTRAINT "actions_approver_id_fkey" FOREIGN KEY ("approver_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "hse"."actions"
    ADD CONSTRAINT "actions_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "hse"."actions"
    ADD CONSTRAINT "actions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "hse"."actions"
    ADD CONSTRAINT "actions_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "hse"."actions"
    ADD CONSTRAINT "actions_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "hse"."reports"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "hse"."audit_log"
    ADD CONSTRAINT "audit_log_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "hse"."audit_log"
    ADD CONSTRAINT "audit_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "hse"."audit_logs"
    ADD CONSTRAINT "audit_logs_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "hse"."audit_logs"
    ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "hse"."competency_assessments"
    ADD CONSTRAINT "competency_assessments_assessor_id_fkey" FOREIGN KEY ("assessor_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "hse"."competency_assessments"
    ADD CONSTRAINT "competency_assessments_competency_id_fkey" FOREIGN KEY ("competency_id") REFERENCES "hse"."competency_framework"("id");



ALTER TABLE ONLY "hse"."competency_assessments"
    ADD CONSTRAINT "competency_assessments_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "hse"."competency_assessments"
    ADD CONSTRAINT "competency_assessments_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "hse"."competency_assessments"
    ADD CONSTRAINT "competency_assessments_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "hse"."competency_framework"
    ADD CONSTRAINT "competency_framework_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "hse"."competency_framework"
    ADD CONSTRAINT "competency_framework_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "hse"."competency_records"
    ADD CONSTRAINT "competency_records_contractor_id_fkey" FOREIGN KEY ("contractor_id") REFERENCES "hse"."contractors"("id");



ALTER TABLE ONLY "hse"."compliance_checklists"
    ADD CONSTRAINT "compliance_checklists_contractor_id_fkey" FOREIGN KEY ("contractor_id") REFERENCES "hse"."contractors"("id");



ALTER TABLE ONLY "hse"."contractor_alerts"
    ADD CONSTRAINT "contractor_alerts_contractor_id_fkey" FOREIGN KEY ("contractor_id") REFERENCES "hse"."contractors"("id");



ALTER TABLE ONLY "hse"."contractor_communications"
    ADD CONSTRAINT "contractor_communications_contractor_id_fkey" FOREIGN KEY ("contractor_id") REFERENCES "hse"."contractors"("id");



ALTER TABLE ONLY "hse"."contractor_documents"
    ADD CONSTRAINT "contractor_documents_contractor_id_fkey" FOREIGN KEY ("contractor_id") REFERENCES "hse"."contractors"("id");



ALTER TABLE ONLY "hse"."contractor_incidents"
    ADD CONSTRAINT "contractor_incidents_contractor_id_fkey" FOREIGN KEY ("contractor_id") REFERENCES "hse"."contractors"("id");



ALTER TABLE ONLY "hse"."contractor_medical_records"
    ADD CONSTRAINT "contractor_medical_records_contractor_id_fkey" FOREIGN KEY ("contractor_id") REFERENCES "hse"."contractors"("id");



ALTER TABLE ONLY "hse"."contractor_reviews"
    ADD CONSTRAINT "contractor_reviews_contractor_id_fkey" FOREIGN KEY ("contractor_id") REFERENCES "hse"."contractors"("id");



ALTER TABLE ONLY "hse"."contractor_site_assignments"
    ADD CONSTRAINT "contractor_site_assignments_contractor_id_fkey" FOREIGN KEY ("contractor_id") REFERENCES "hse"."contractors"("id");



ALTER TABLE ONLY "hse"."environmental_records"
    ADD CONSTRAINT "environmental_records_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "hse"."environmental_records"
    ADD CONSTRAINT "environmental_records_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "hse"."exposure_log"
    ADD CONSTRAINT "exposure_log_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "hse"."exposure_log"
    ADD CONSTRAINT "exposure_log_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "hse"."exposure_log"
    ADD CONSTRAINT "exposure_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "hse"."fire_drills"
    ADD CONSTRAINT "fire_drills_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "hse"."fire_drills"
    ADD CONSTRAINT "fire_drills_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "hse"."fire_equipment"
    ADD CONSTRAINT "fire_equipment_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "hse"."fire_equipment"
    ADD CONSTRAINT "fire_equipment_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "hse"."fire_safety_records"
    ADD CONSTRAINT "fire_safety_records_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "hse"."fire_safety_records"
    ADD CONSTRAINT "fire_safety_records_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "hse"."fire_safety_records"
    ADD CONSTRAINT "fire_safety_records_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "hse"."health_records"
    ADD CONSTRAINT "health_records_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "hse"."health_records"
    ADD CONSTRAINT "health_records_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "hse"."health_records"
    ADD CONSTRAINT "health_records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "hse"."project_members"
    ADD CONSTRAINT "project_members_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "hse"."team_members"("id");



ALTER TABLE ONLY "hse"."project_members"
    ADD CONSTRAINT "project_members_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "hse"."team_projects"("id");



ALTER TABLE ONLY "hse"."report_attachments"
    ADD CONSTRAINT "report_attachments_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "hse"."reports"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "hse"."report_attachments"
    ADD CONSTRAINT "report_attachments_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "hse"."reports"
    ADD CONSTRAINT "reports_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "hse"."reports"
    ADD CONSTRAINT "reports_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id");



ALTER TABLE ONLY "hse"."reports"
    ADD CONSTRAINT "reports_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "hse"."reports"
    ADD CONSTRAINT "reports_reported_by_fkey" FOREIGN KEY ("reported_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "hse"."reports"
    ADD CONSTRAINT "reports_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id");



ALTER TABLE ONLY "hse"."risk_register"
    ADD CONSTRAINT "risk_register_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "hse"."risk_register"
    ADD CONSTRAINT "risk_register_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "hse"."risk_register"
    ADD CONSTRAINT "risk_register_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "hse"."role_definitions"
    ADD CONSTRAINT "role_definitions_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "hse"."safety_inductions"
    ADD CONSTRAINT "safety_inductions_contractor_id_fkey" FOREIGN KEY ("contractor_id") REFERENCES "hse"."contractors"("id");



ALTER TABLE ONLY "hse"."safety_moment_comments"
    ADD CONSTRAINT "safety_moment_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "hse"."safety_moment_ratings"
    ADD CONSTRAINT "safety_moment_ratings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "hse"."safety_moment_subcategories"
    ADD CONSTRAINT "safety_moment_subcategories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "hse"."safety_moment_categories"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "hse"."safety_moments_library"
    ADD CONSTRAINT "safety_moments_library_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "hse"."safety_moment_categories"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "hse"."safety_moments_library"
    ADD CONSTRAINT "safety_moments_library_subcategory_id_fkey" FOREIGN KEY ("subcategory_id") REFERENCES "hse"."safety_moment_subcategories"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "hse"."security_incidents"
    ADD CONSTRAINT "security_incidents_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "hse"."security_incidents"
    ADD CONSTRAINT "security_incidents_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "hse"."security_incidents"
    ADD CONSTRAINT "security_incidents_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "hse"."spill_records"
    ADD CONSTRAINT "spill_records_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "hse"."spill_records"
    ADD CONSTRAINT "spill_records_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "hse"."spill_records"
    ADD CONSTRAINT "spill_records_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "hse"."spill_response"
    ADD CONSTRAINT "spill_response_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "hse"."spill_response"
    ADD CONSTRAINT "spill_response_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "hse"."spill_response"
    ADD CONSTRAINT "spill_response_spill_id_fkey" FOREIGN KEY ("spill_id") REFERENCES "hse"."spill_records"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "hse"."subscriptions"
    ADD CONSTRAINT "subscriptions_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "hse"."team_members"
    ADD CONSTRAINT "team_members_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "hse"."roles"("id");



ALTER TABLE ONLY "hse"."team_members"
    ADD CONSTRAINT "team_members_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "hse"."teams"("id");



ALTER TABLE ONLY "hse"."team_performance"
    ADD CONSTRAINT "team_performance_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "hse"."teams"("id");



ALTER TABLE ONLY "hse"."team_projects"
    ADD CONSTRAINT "team_projects_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "hse"."teams"("id");



ALTER TABLE ONLY "hse"."team_resources"
    ADD CONSTRAINT "team_resources_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "hse"."team_members"("id");



ALTER TABLE ONLY "hse"."team_resources"
    ADD CONSTRAINT "team_resources_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "hse"."teams"("id");



ALTER TABLE ONLY "hse"."team_tasks"
    ADD CONSTRAINT "team_tasks_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "hse"."team_members"("id");



ALTER TABLE ONLY "hse"."team_tasks"
    ADD CONSTRAINT "team_tasks_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "hse"."team_projects"("id");



ALTER TABLE ONLY "hse"."team_tasks"
    ADD CONSTRAINT "team_tasks_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "hse"."teams"("id");



ALTER TABLE ONLY "hse"."training_attendance"
    ADD CONSTRAINT "training_attendance_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "hse"."training_attendance"
    ADD CONSTRAINT "training_attendance_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "hse"."training_attendance"
    ADD CONSTRAINT "training_attendance_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "hse"."training_attendance"
    ADD CONSTRAINT "training_attendance_training_id_fkey" FOREIGN KEY ("training_id") REFERENCES "hse"."training_schedule"("id");



ALTER TABLE ONLY "hse"."training_feedback"
    ADD CONSTRAINT "training_feedback_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "hse"."training_feedback"
    ADD CONSTRAINT "training_feedback_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "hse"."training_feedback"
    ADD CONSTRAINT "training_feedback_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "hse"."training_feedback"
    ADD CONSTRAINT "training_feedback_training_id_fkey" FOREIGN KEY ("training_id") REFERENCES "hse"."training_schedule"("id");



ALTER TABLE ONLY "hse"."training_programs"
    ADD CONSTRAINT "training_programs_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "hse"."training_programs"
    ADD CONSTRAINT "training_programs_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "hse"."training_records"
    ADD CONSTRAINT "training_records_contractor_id_fkey" FOREIGN KEY ("contractor_id") REFERENCES "hse"."contractors"("id");



ALTER TABLE ONLY "hse"."training_schedule"
    ADD CONSTRAINT "training_schedule_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "hse"."training_schedule"
    ADD CONSTRAINT "training_schedule_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "public"."sites"("id");



ALTER TABLE ONLY "hse"."training_schedule"
    ADD CONSTRAINT "training_schedule_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "hse"."training_schedule"
    ADD CONSTRAINT "training_schedule_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "hse"."training_programs"("id");



ALTER TABLE ONLY "hse"."training_schedule"
    ADD CONSTRAINT "training_schedule_trainer_id_fkey" FOREIGN KEY ("trainer_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "hse"."user_safety_moments"
    ADD CONSTRAINT "user_safety_moments_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "hse"."safety_moment_categories"("id");



ALTER TABLE ONLY "hse"."user_safety_moments"
    ADD CONSTRAINT "user_safety_moments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "hse"."waste_management"
    ADD CONSTRAINT "waste_management_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "hse"."waste_management"
    ADD CONSTRAINT "waste_management_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."absence_records"
    ADD CONSTRAINT "absence_records_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."absence_records"
    ADD CONSTRAINT "absence_records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."access_audit_log"
    ADD CONSTRAINT "access_audit_log_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."access_audit_log"
    ADD CONSTRAINT "access_audit_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."access_credentials"
    ADD CONSTRAINT "access_credentials_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."access_credentials"
    ADD CONSTRAINT "access_credentials_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."access_logs"
    ADD CONSTRAINT "access_logs_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."access_logs"
    ADD CONSTRAINT "access_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."access_requests"
    ADD CONSTRAINT "access_requests_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "public"."organization_members"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."access_requests"
    ADD CONSTRAINT "access_requests_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."access_requests"
    ADD CONSTRAINT "access_requests_responded_by_fkey" FOREIGN KEY ("responded_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."actions"
    ADD CONSTRAINT "actions_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."actions"
    ADD CONSTRAINT "actions_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "public"."incidents"("id");



ALTER TABLE ONLY "public"."afe_changes"
    ADD CONSTRAINT "afe_changes_afe_id_fkey" FOREIGN KEY ("afe_id") REFERENCES "public"."afes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."afe_cost_items"
    ADD CONSTRAINT "afe_cost_items_afe_id_fkey" FOREIGN KEY ("afe_id") REFERENCES "public"."afes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."afe_invoices"
    ADD CONSTRAINT "afe_invoices_afe_id_fkey" FOREIGN KEY ("afe_id") REFERENCES "public"."afes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."afe_invoices"
    ADD CONSTRAINT "afe_invoices_cost_item_id_fkey" FOREIGN KEY ("cost_item_id") REFERENCES "public"."afe_cost_items"("id");



ALTER TABLE ONLY "public"."afes"
    ADD CONSTRAINT "afes_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id");



ALTER TABLE ONLY "public"."afes"
    ADD CONSTRAINT "afes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."ai_insights"
    ADD CONSTRAINT "ai_insights_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."alerts"
    ADD CONSTRAINT "alerts_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."alerts"
    ADD CONSTRAINT "alerts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."alerts"
    ADD CONSTRAINT "alerts_well_id_fkey" FOREIGN KEY ("well_id") REFERENCES "public"."wells"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."allocations"
    ADD CONSTRAINT "allocations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."analytics_insights"
    ADD CONSTRAINT "analytics_insights_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."annuli"
    ADD CONSTRAINT "annuli_casing_string_id_fkey" FOREIGN KEY ("casing_string_id") REFERENCES "public"."casing_strings"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."anticollision_checks"
    ADD CONSTRAINT "anticollision_checks_trajectory_plan_id_fkey" FOREIGN KEY ("trajectory_plan_id") REFERENCES "public"."trajectory_plans"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."anticollision_checks"
    ADD CONSTRAINT "anticollision_checks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."api_keys"
    ADD CONSTRAINT "api_keys_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."api_keys"
    ADD CONSTRAINT "api_keys_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."app_activity_log"
    ADD CONSTRAINT "app_activity_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."app_analytics_daily"
    ADD CONSTRAINT "app_analytics_daily_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."app_seat_assignments"
    ADD CONSTRAINT "app_seat_assignments_assigned_by_fkey" FOREIGN KEY ("assigned_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."app_seat_assignments"
    ADD CONSTRAINT "app_seat_assignments_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."app_seat_assignments"
    ADD CONSTRAINT "app_seat_assignments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."artificial_lift_designs"
    ADD CONSTRAINT "artificial_lift_designs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."asset_summary"
    ADD CONSTRAINT "asset_summary_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."behavioral_anomalies"
    ADD CONSTRAINT "behavioral_anomalies_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."behavioral_anomalies"
    ADD CONSTRAINT "behavioral_anomalies_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."benchmarking_data"
    ADD CONSTRAINT "benchmarking_data_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."bf_activity_log"
    ADD CONSTRAINT "bf_activity_log_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."bf_projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."bf_activity_log"
    ADD CONSTRAINT "bf_activity_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."bf_activity_log"
    ADD CONSTRAINT "bf_activity_log_well_id_fkey" FOREIGN KEY ("well_id") REFERENCES "public"."bf_wells"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."bf_comments"
    ADD CONSTRAINT "bf_comments_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."bf_projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."bf_comments"
    ADD CONSTRAINT "bf_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."bf_comments"
    ADD CONSTRAINT "bf_comments_well_id_fkey" FOREIGN KEY ("well_id") REFERENCES "public"."bf_wells"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."bf_jobs"
    ADD CONSTRAINT "bf_jobs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."bf_projects"
    ADD CONSTRAINT "bf_projects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."bf_team_members"
    ADD CONSTRAINT "bf_team_members_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."bf_projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."bf_team_members"
    ADD CONSTRAINT "bf_team_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."bf_versions"
    ADD CONSTRAINT "bf_versions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."bf_versions"
    ADD CONSTRAINT "bf_versions_well_id_fkey" FOREIGN KEY ("well_id") REFERENCES "public"."bf_wells"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."bf_wells"
    ADD CONSTRAINT "bf_wells_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."bf_projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."bf_wells"
    ADD CONSTRAINT "bf_wells_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."bhas"
    ADD CONSTRAINT "bhas_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."bhas"
    ADD CONSTRAINT "bhas_well_id_fkey" FOREIGN KEY ("well_id") REFERENCES "public"."wells"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."branding_audit_log"
    ADD CONSTRAINT "branding_audit_log_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."branding_audit_log"
    ADD CONSTRAINT "branding_audit_log_performed_by_fkey" FOREIGN KEY ("performed_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."branding_presets"
    ADD CONSTRAINT "branding_presets_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."branding_presets"
    ADD CONSTRAINT "branding_presets_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."branding_templates"
    ADD CONSTRAINT "branding_templates_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."bulk_import_jobs"
    ADD CONSTRAINT "bulk_import_jobs_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."bulk_import_jobs"
    ADD CONSTRAINT "bulk_import_jobs_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."calc_runs"
    ADD CONSTRAINT "calc_runs_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "public"."load_cases"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."calc_runs"
    ADD CONSTRAINT "calc_runs_casing_string_id_fkey" FOREIGN KEY ("casing_string_id") REFERENCES "public"."casing_strings"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."calibration_data"
    ADD CONSTRAINT "calibration_data_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."expert_mode_sessions"("id");



ALTER TABLE ONLY "public"."calibration_results"
    ADD CONSTRAINT "calibration_results_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."bf_projects"("id");



ALTER TABLE ONLY "public"."casing_schemes"
    ADD CONSTRAINT "casing_schemes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."casing_schemes"
    ADD CONSTRAINT "casing_schemes_well_id_fkey" FOREIGN KEY ("well_id") REFERENCES "public"."wells"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."casing_strings"
    ADD CONSTRAINT "casing_strings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."cement_jobs"
    ADD CONSTRAINT "cement_jobs_casing_scheme_id_fkey" FOREIGN KEY ("casing_scheme_id") REFERENCES "public"."casing_schemes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."cement_jobs"
    ADD CONSTRAINT "cement_jobs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."cementing_simulation_projects"
    ADD CONSTRAINT "cementing_simulation_projects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."completion_plans"
    ADD CONSTRAINT "completion_plans_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."completion_plans"
    ADD CONSTRAINT "completion_plans_vault_id_fkey" FOREIGN KEY ("vault_id") REFERENCES "public"."frac_vault"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."completion_plans"
    ADD CONSTRAINT "completion_plans_well_id_fkey" FOREIGN KEY ("well_id") REFERENCES "public"."wells"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."compliance_audits"
    ADD CONSTRAINT "compliance_audits_auditor_id_fkey" FOREIGN KEY ("auditor_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."compliance_audits"
    ADD CONSTRAINT "compliance_audits_framework_id_fkey" FOREIGN KEY ("framework_id") REFERENCES "public"."compliance_frameworks"("id");



ALTER TABLE ONLY "public"."compliance_audits"
    ADD CONSTRAINT "compliance_audits_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."compliance_frameworks"
    ADD CONSTRAINT "compliance_frameworks_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."compliance_requirements"
    ADD CONSTRAINT "compliance_requirements_framework_id_fkey" FOREIGN KEY ("framework_id") REFERENCES "public"."compliance_frameworks"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."compliance_rules"
    ADD CONSTRAINT "compliance_rules_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."compliance_rules"
    ADD CONSTRAINT "compliance_rules_responsible_person_id_fkey" FOREIGN KEY ("responsible_person_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."connectors"
    ADD CONSTRAINT "connectors_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."contour_projects"
    ADD CONSTRAINT "contour_projects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."custom_fields"
    ADD CONSTRAINT "custom_fields_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."custom_workflows"
    ADD CONSTRAINT "custom_workflows_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."data_quality_metrics"
    ADD CONSTRAINT "data_quality_metrics_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."data_uploads"
    ADD CONSTRAINT "data_uploads_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."departments"
    ADD CONSTRAINT "departments_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."departments"
    ADD CONSTRAINT "departments_org_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."doc_activity_log"
    ADD CONSTRAINT "doc_activity_log_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."doc_comments"
    ADD CONSTRAINT "doc_comments_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."doc_comments"
    ADD CONSTRAINT "doc_comments_revision_id_fkey" FOREIGN KEY ("revision_id") REFERENCES "public"."doc_revisions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."doc_distribution"
    ADD CONSTRAINT "doc_distribution_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."doc_revisions"
    ADD CONSTRAINT "doc_revisions_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "public"."documents"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."doc_workflows"
    ADD CONSTRAINT "doc_workflows_revision_id_fkey" FOREIGN KEY ("revision_id") REFERENCES "public"."doc_revisions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."documents"
    ADD CONSTRAINT "documents_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."doc_categories"("id");



ALTER TABLE ONLY "public"."econ_afe_budgets"
    ADD CONSTRAINT "econ_afe_budgets_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."econ_afe_budgets"
    ADD CONSTRAINT "econ_afe_budgets_model_id_fkey" FOREIGN KEY ("model_id") REFERENCES "public"."econ_models_v2"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."econ_afe_budgets"
    ADD CONSTRAINT "econ_afe_budgets_scenario_id_fkey" FOREIGN KEY ("scenario_id") REFERENCES "public"."econ_scenarios_v2"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."econ_audit_log"
    ADD CONSTRAINT "econ_audit_log_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."econ_audit_log"
    ADD CONSTRAINT "econ_audit_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."econ_fdp_snapshots"
    ADD CONSTRAINT "econ_fdp_snapshots_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."econ_fdp_snapshots"
    ADD CONSTRAINT "econ_fdp_snapshots_model_id_fkey" FOREIGN KEY ("model_id") REFERENCES "public"."econ_models_v2"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."econ_fdp_snapshots"
    ADD CONSTRAINT "econ_fdp_snapshots_scenario_id_fkey" FOREIGN KEY ("scenario_id") REFERENCES "public"."econ_scenarios_v2"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."econ_fiscal_terms"
    ADD CONSTRAINT "econ_fiscal_terms_scenario_id_fkey" FOREIGN KEY ("scenario_id") REFERENCES "public"."econ_scenarios"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."econ_imports"
    ADD CONSTRAINT "econ_imports_imported_by_fkey" FOREIGN KEY ("imported_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."econ_imports"
    ADD CONSTRAINT "econ_imports_model_id_fkey" FOREIGN KEY ("model_id") REFERENCES "public"."econ_models_v2"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."econ_inputs"
    ADD CONSTRAINT "econ_inputs_scenario_id_fkey" FOREIGN KEY ("scenario_id") REFERENCES "public"."econ_scenarios"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."econ_line_items"
    ADD CONSTRAINT "econ_line_items_scenario_id_fkey" FOREIGN KEY ("scenario_id") REFERENCES "public"."econ_scenarios"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."econ_metrics"
    ADD CONSTRAINT "econ_metrics_scenario_id_fkey" FOREIGN KEY ("scenario_id") REFERENCES "public"."econ_scenarios_v2"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."econ_models"
    ADD CONSTRAINT "econ_models_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."econ_models"
    ADD CONSTRAINT "econ_models_last_modified_by_fkey" FOREIGN KEY ("last_modified_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."econ_models"
    ADD CONSTRAINT "econ_models_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."econ_projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."econ_models"
    ADD CONSTRAINT "econ_models_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."econ_models_v2"
    ADD CONSTRAINT "econ_models_v2_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."econ_models_v2"
    ADD CONSTRAINT "econ_models_v2_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."econ_projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."econ_models_v2"
    ADD CONSTRAINT "econ_models_v2_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."econ_projects"
    ADD CONSTRAINT "econ_projects_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."econ_projects"
    ADD CONSTRAINT "econ_projects_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."econ_projects"
    ADD CONSTRAINT "econ_projects_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."econ_results"
    ADD CONSTRAINT "econ_results_scenario_id_fkey" FOREIGN KEY ("scenario_id") REFERENCES "public"."econ_scenarios"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."econ_scenario_notes"
    ADD CONSTRAINT "econ_scenario_notes_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."econ_scenario_notes"
    ADD CONSTRAINT "econ_scenario_notes_scenario_id_fkey" FOREIGN KEY ("scenario_id") REFERENCES "public"."econ_scenarios_v2"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."econ_scenarios"
    ADD CONSTRAINT "econ_scenarios_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."econ_scenarios"
    ADD CONSTRAINT "econ_scenarios_model_id_fkey" FOREIGN KEY ("model_id") REFERENCES "public"."econ_models"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."econ_scenarios_v2"
    ADD CONSTRAINT "econ_scenarios_v2_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."econ_scenarios_v2"
    ADD CONSTRAINT "econ_scenarios_v2_model_id_fkey" FOREIGN KEY ("model_id") REFERENCES "public"."econ_models_v2"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."econ_sensitivity_results"
    ADD CONSTRAINT "econ_sensitivity_results_scenario_id_fkey" FOREIGN KEY ("scenario_id") REFERENCES "public"."econ_scenarios_v2"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."econ_timegrid"
    ADD CONSTRAINT "econ_timegrid_model_id_fkey" FOREIGN KEY ("model_id") REFERENCES "public"."econ_models"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."em_fault_sticks"
    ADD CONSTRAINT "em_fault_sticks_fault_id_fkey" FOREIGN KEY ("fault_id") REFERENCES "public"."em_faults"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."em_faults"
    ADD CONSTRAINT "em_faults_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."em_projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."em_grid_properties"
    ADD CONSTRAINT "em_grid_properties_grid_id_fkey" FOREIGN KEY ("grid_id") REFERENCES "public"."em_grids"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."em_grids"
    ADD CONSTRAINT "em_grids_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."em_projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."em_jobs"
    ADD CONSTRAINT "em_jobs_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."em_projects"("id");



ALTER TABLE ONLY "public"."em_object_templates"
    ADD CONSTRAINT "em_object_templates_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."em_objects"
    ADD CONSTRAINT "em_objects_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."em_projects"("id");



ALTER TABLE ONLY "public"."em_objects"
    ADD CONSTRAINT "em_objects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."em_petro_analyses"
    ADD CONSTRAINT "em_petro_analyses_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."em_projects"("id");



ALTER TABLE ONLY "public"."em_petro_analyses"
    ADD CONSTRAINT "em_petro_analyses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."em_petro_templates"
    ADD CONSTRAINT "em_petro_templates_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."em_projects"
    ADD CONSTRAINT "em_projects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."em_surface_points"
    ADD CONSTRAINT "em_surface_points_surface_id_fkey" FOREIGN KEY ("surface_id") REFERENCES "public"."em_surfaces"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."em_surfaces"
    ADD CONSTRAINT "em_surfaces_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."em_projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."em_volumes"
    ADD CONSTRAINT "em_volumes_grid_id_fkey" FOREIGN KEY ("grid_id") REFERENCES "public"."em_grids"("id");



ALTER TABLE ONLY "public"."em_volumes"
    ADD CONSTRAINT "em_volumes_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."em_projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."em_well_logs"
    ADD CONSTRAINT "em_well_logs_well_id_fkey" FOREIGN KEY ("well_id") REFERENCES "public"."em_wells"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."em_wells"
    ADD CONSTRAINT "em_wells_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."em_projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."em_wells"
    ADD CONSTRAINT "em_wells_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."employee_app_access"
    ADD CONSTRAINT "employee_app_access_granted_by_fkey" FOREIGN KEY ("granted_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."employee_app_access"
    ADD CONSTRAINT "employee_app_access_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "public"."organization_members"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."employee_app_access"
    ADD CONSTRAINT "employee_app_access_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."employee_storage"
    ADD CONSTRAINT "employee_storage_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "public"."organization_members"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."employee_storage"
    ADD CONSTRAINT "employee_storage_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."enterprise_quotes"
    ADD CONSTRAINT "enterprise_quotes_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."environment_emp_actions"
    ADD CONSTRAINT "environment_emp_actions_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."environment_emp_actions"
    ADD CONSTRAINT "environment_emp_actions_study_id_fkey" FOREIGN KEY ("study_id") REFERENCES "public"."environment_studies"("id");



ALTER TABLE ONLY "public"."environment_facilities"
    ADD CONSTRAINT "environment_facilities_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."environment_flaring_logs"
    ADD CONSTRAINT "environment_flaring_logs_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "public"."environment_facilities"("id");



ALTER TABLE ONLY "public"."environment_flaring_logs"
    ADD CONSTRAINT "environment_flaring_logs_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."environment_metrics"
    ADD CONSTRAINT "environment_metrics_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."environment_monitoring_results"
    ADD CONSTRAINT "environment_monitoring_results_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "public"."environment_facilities"("id");



ALTER TABLE ONLY "public"."environment_monitoring_results"
    ADD CONSTRAINT "environment_monitoring_results_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."environment_obligations"
    ADD CONSTRAINT "environment_obligations_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "public"."environment_facilities"("id");



ALTER TABLE ONLY "public"."environment_obligations"
    ADD CONSTRAINT "environment_obligations_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."environment_permits"
    ADD CONSTRAINT "environment_permits_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "public"."environment_facilities"("id");



ALTER TABLE ONLY "public"."environment_permits"
    ADD CONSTRAINT "environment_permits_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."environment_spill_reports"
    ADD CONSTRAINT "environment_spill_reports_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."environment_studies"
    ADD CONSTRAINT "environment_studies_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "public"."environment_facilities"("id");



ALTER TABLE ONLY "public"."environment_studies"
    ADD CONSTRAINT "environment_studies_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."environment_waste_manifests"
    ADD CONSTRAINT "environment_waste_manifests_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."environmental_monitoring"
    ADD CONSTRAINT "environmental_monitoring_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."environmental_monitoring"
    ADD CONSTRAINT "environmental_monitoring_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "public"."organization_sites"("id");



ALTER TABLE ONLY "public"."epe_capex"
    ADD CONSTRAINT "epe_capex_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "public"."epe_cases"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."epe_capex"
    ADD CONSTRAINT "epe_capex_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."epe_cases"
    ADD CONSTRAINT "epe_cases_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."epe_opex"
    ADD CONSTRAINT "epe_opex_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "public"."epe_cases"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."epe_opex"
    ADD CONSTRAINT "epe_opex_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."epe_production_volumes"
    ADD CONSTRAINT "epe_production_volumes_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "public"."epe_cases"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."epe_production_volumes"
    ADD CONSTRAINT "epe_production_volumes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."epe_results"
    ADD CONSTRAINT "epe_results_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "public"."epe_runs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."epe_results"
    ADD CONSTRAINT "epe_results_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."epe_run_configs"
    ADD CONSTRAINT "epe_run_configs_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "public"."epe_cases"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."epe_run_configs"
    ADD CONSTRAINT "epe_run_configs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."epe_runs"
    ADD CONSTRAINT "epe_runs_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "public"."epe_cases"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."epe_runs"
    ADD CONSTRAINT "epe_runs_run_config_id_fkey" FOREIGN KEY ("run_config_id") REFERENCES "public"."epe_run_configs"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."epe_runs"
    ADD CONSTRAINT "epe_runs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."epe_sensitivity_results"
    ADD CONSTRAINT "epe_sensitivity_results_sensitivity_run_id_fkey" FOREIGN KEY ("sensitivity_run_id") REFERENCES "public"."epe_sensitivity_runs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."epe_sensitivity_runs"
    ADD CONSTRAINT "epe_sensitivity_runs_base_run_config_id_fkey" FOREIGN KEY ("base_run_config_id") REFERENCES "public"."epe_run_configs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."epe_sensitivity_runs"
    ADD CONSTRAINT "epe_sensitivity_runs_base_run_id_fkey" FOREIGN KEY ("base_run_id") REFERENCES "public"."epe_runs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."epe_sensitivity_runs"
    ADD CONSTRAINT "epe_sensitivity_runs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."events"
    ADD CONSTRAINT "events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."events"
    ADD CONSTRAINT "events_well_id_fkey" FOREIGN KEY ("well_id") REFERENCES "public"."wells"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."expert_mode_sessions"
    ADD CONSTRAINT "expert_mode_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."expert_mode_settings"
    ADD CONSTRAINT "expert_mode_settings_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."bf_projects"("id");



ALTER TABLE ONLY "public"."expert_mode_settings"
    ADD CONSTRAINT "expert_mode_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."facility_layouts"
    ADD CONSTRAINT "facility_layouts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."fdp_facilities"
    ADD CONSTRAINT "fdp_facilities_fdp_project_id_fkey" FOREIGN KEY ("fdp_project_id") REFERENCES "public"."fdp_projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."fdp_price_decks"
    ADD CONSTRAINT "fdp_price_decks_fdp_project_id_fkey" FOREIGN KEY ("fdp_project_id") REFERENCES "public"."fdp_projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."fdp_projects"
    ADD CONSTRAINT "fdp_projects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."fdp_wells"
    ADD CONSTRAINT "fdp_wells_fdp_project_id_fkey" FOREIGN KEY ("fdp_project_id") REFERENCES "public"."fdp_projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."feedback"
    ADD CONSTRAINT "feedback_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."feedback"
    ADD CONSTRAINT "feedback_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."fire_drills"
    ADD CONSTRAINT "fire_drills_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."fire_emergency_response_plans"
    ADD CONSTRAINT "fire_emergency_response_plans_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."fire_equipment_inventory"
    ADD CONSTRAINT "fire_equipment_inventory_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."fire_equipment_maintenance"
    ADD CONSTRAINT "fire_equipment_maintenance_inventory_id_fkey" FOREIGN KEY ("inventory_id") REFERENCES "public"."fire_equipment_inventory"("id");



ALTER TABLE ONLY "public"."fire_equipment_maintenance"
    ADD CONSTRAINT "fire_equipment_maintenance_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."fire_incident_investigation"
    ADD CONSTRAINT "fire_incident_investigation_incident_id_fkey" FOREIGN KEY ("incident_id") REFERENCES "public"."fire_incidents"("id");



ALTER TABLE ONLY "public"."fire_incident_investigation"
    ADD CONSTRAINT "fire_incident_investigation_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."fire_incidents"
    ADD CONSTRAINT "fire_incidents_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."fire_safety_compliance"
    ADD CONSTRAINT "fire_safety_compliance_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."fire_safety_risks"
    ADD CONSTRAINT "fire_safety_risks_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."fiscal_regime_projects"
    ADD CONSTRAINT "fiscal_regime_projects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."fitness_activities"
    ADD CONSTRAINT "fitness_activities_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."fitness_activities"
    ADD CONSTRAINT "fitness_activities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."fitness_goals"
    ADD CONSTRAINT "fitness_goals_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."fitness_goals"
    ADD CONSTRAINT "fitness_goals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."flow_assurance_projects"
    ADD CONSTRAINT "flow_assurance_projects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."fluid_studio_projects"
    ADD CONSTRAINT "fluid_studio_projects_reservoir_id_fkey" FOREIGN KEY ("reservoir_id") REFERENCES "public"."reservoirs"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."fluid_studio_projects"
    ADD CONSTRAINT "fluid_studio_projects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."frac_completion_projects"
    ADD CONSTRAINT "frac_completion_projects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."frac_vault"
    ADD CONSTRAINT "frac_vault_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."geomech_measurements"
    ADD CONSTRAINT "geomech_measurements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."geomech_measurements"
    ADD CONSTRAINT "geomech_measurements_well_id_fkey" FOREIGN KEY ("well_id") REFERENCES "public"."wells"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."geomech_params"
    ADD CONSTRAINT "geomech_params_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."geomech_params"
    ADD CONSTRAINT "geomech_params_well_id_fkey" FOREIGN KEY ("well_id") REFERENCES "public"."wells"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."geomech_velocity"
    ADD CONSTRAINT "geomech_velocity_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."geomech_velocity"
    ADD CONSTRAINT "geomech_velocity_well_id_fkey" FOREIGN KEY ("well_id") REFERENCES "public"."wells"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."geomechanics_projects"
    ADD CONSTRAINT "geomechanics_projects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."gm_curves"
    ADD CONSTRAINT "gm_curves_dataset_id_fkey" FOREIGN KEY ("dataset_id") REFERENCES "public"."gm_datasets"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."gm_curves"
    ADD CONSTRAINT "gm_curves_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."gm_datasets"
    ADD CONSTRAINT "gm_datasets_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."gm_datasets"
    ADD CONSTRAINT "gm_datasets_well_id_fkey" FOREIGN KEY ("well_id") REFERENCES "public"."gm_wells"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."gm_events"
    ADD CONSTRAINT "gm_events_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."gm_events"
    ADD CONSTRAINT "gm_events_well_id_fkey" FOREIGN KEY ("well_id") REFERENCES "public"."gm_wells"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."gm_models"
    ADD CONSTRAINT "gm_models_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."gm_models"
    ADD CONSTRAINT "gm_models_well_id_fkey" FOREIGN KEY ("well_id") REFERENCES "public"."gm_wells"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."gm_run_points"
    ADD CONSTRAINT "gm_run_points_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."gm_run_points"
    ADD CONSTRAINT "gm_run_points_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "public"."gm_runs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."gm_runs"
    ADD CONSTRAINT "gm_runs_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."gm_runs"
    ADD CONSTRAINT "gm_runs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."gm_wells"
    ADD CONSTRAINT "gm_wells_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."hazard_assessments"
    ADD CONSTRAINT "hazard_assessments_assessed_by_fkey" FOREIGN KEY ("assessed_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."hazard_assessments"
    ADD CONSTRAINT "hazard_assessments_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."hazard_assessments"
    ADD CONSTRAINT "hazard_assessments_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "public"."organization_sites"("id");



ALTER TABLE ONLY "public"."health_metrics"
    ADD CONSTRAINT "health_metrics_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."health_profiles"
    ADD CONSTRAINT "health_profiles_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."health_profiles"
    ADD CONSTRAINT "health_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."health_screenings"
    ADD CONSTRAINT "health_screenings_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."health_screenings"
    ADD CONSTRAINT "health_screenings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."help_articles"
    ADD CONSTRAINT "help_articles_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."help_categories"("id");



ALTER TABLE ONLY "public"."help_articles"
    ADD CONSTRAINT "help_articles_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."help_feedback"
    ADD CONSTRAINT "help_feedback_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "public"."help_articles"("id");



ALTER TABLE ONLY "public"."help_feedback"
    ADD CONSTRAINT "help_feedback_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."hydraulics_runs"
    ADD CONSTRAINT "hydraulics_runs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."hydraulics_runs"
    ADD CONSTRAINT "hydraulics_runs_well_id_fkey" FOREIGN KEY ("well_id") REFERENCES "public"."wells"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."incident_attachments"
    ADD CONSTRAINT "incident_attachments_incident_id_fkey" FOREIGN KEY ("incident_id") REFERENCES "public"."incidents"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."incident_comments"
    ADD CONSTRAINT "incident_comments_incident_id_fkey" FOREIGN KEY ("incident_id") REFERENCES "public"."incidents"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."incident_comments"
    ADD CONSTRAINT "incident_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."incidents"
    ADD CONSTRAINT "incidents_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."incidents"
    ADD CONSTRAINT "incidents_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."incidents"
    ADD CONSTRAINT "incidents_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "public"."organization_sites"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."incidents"
    ADD CONSTRAINT "incidents_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "public"."templates"("id");



ALTER TABLE ONLY "public"."integration_logs"
    ADD CONSTRAINT "integration_logs_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."integration_snapshots"
    ADD CONSTRAINT "integration_snapshots_model_id_fkey" FOREIGN KEY ("model_id") REFERENCES "public"."econ_models_v2"("id");



ALTER TABLE ONLY "public"."integration_snapshots"
    ADD CONSTRAINT "integration_snapshots_scenario_id_fkey" FOREIGN KEY ("scenario_id") REFERENCES "public"."econ_scenarios_v2"("id");



ALTER TABLE ONLY "public"."integration_snapshots"
    ADD CONSTRAINT "integration_snapshots_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."invitations"
    ADD CONSTRAINT "invitations_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id");



ALTER TABLE ONLY "public"."invitations"
    ADD CONSTRAINT "invitations_invited_by_fkey" FOREIGN KEY ("invited_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."invitations"
    ADD CONSTRAINT "invitations_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."invoices"
    ADD CONSTRAINT "invoices_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."key_personnel"
    ADD CONSTRAINT "key_personnel_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."key_personnel"
    ADD CONSTRAINT "key_personnel_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."leaderboard_history"
    ADD CONSTRAINT "leaderboard_history_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."leaderboard_history"
    ADD CONSTRAINT "leaderboard_history_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "public"."quick_reports"("id");



ALTER TABLE ONLY "public"."leaderboard_history"
    ADD CONSTRAINT "leaderboard_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."leaderboard_scores"
    ADD CONSTRAINT "leaderboard_scores_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."leaderboard_scores"
    ADD CONSTRAINT "leaderboard_scores_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."load_cases"
    ADD CONSTRAINT "load_cases_casing_string_id_fkey" FOREIGN KEY ("casing_string_id") REFERENCES "public"."casing_strings"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."load_cases"
    ADD CONSTRAINT "load_cases_well_id_fkey" FOREIGN KEY ("well_id") REFERENCES "public"."wells"("id");



ALTER TABLE ONLY "public"."log_digitizer_projects"
    ADD CONSTRAINT "log_digitizer_projects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."log_facies_projects"
    ADD CONSTRAINT "log_facies_projects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."master_apps"
    ADD CONSTRAINT "master_apps_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "public"."modules"("id");



ALTER TABLE ONLY "public"."medical_certifications"
    ADD CONSTRAINT "medical_certifications_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."medical_certifications"
    ADD CONSTRAINT "medical_certifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."mem_activity_log"
    ADD CONSTRAINT "mem_activity_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."mem_activity_log"
    ADD CONSTRAINT "mem_activity_log_well_id_fkey" FOREIGN KEY ("well_id") REFERENCES "public"."mem_wells"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."mem_batch_jobs"
    ADD CONSTRAINT "mem_batch_jobs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."mem_calculations"
    ADD CONSTRAINT "mem_calculations_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."mem_projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."mem_comments"
    ADD CONSTRAINT "mem_comments_mem_id_fkey" FOREIGN KEY ("mem_id") REFERENCES "public"."mems"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."mem_comments"
    ADD CONSTRAINT "mem_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."mem_edge_function_jobs"
    ADD CONSTRAINT "mem_edge_function_jobs_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."mem_projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."mem_edge_function_jobs"
    ADD CONSTRAINT "mem_edge_function_jobs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."mem_mechanical_properties"
    ADD CONSTRAINT "mem_mechanical_properties_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."mem_projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."mem_pressure_data"
    ADD CONSTRAINT "mem_pressure_data_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."mem_projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."mem_projects"
    ADD CONSTRAINT "mem_projects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."mem_scenarios"
    ADD CONSTRAINT "mem_scenarios_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."expert_mode_sessions"("id");



ALTER TABLE ONLY "public"."mem_team_access"
    ADD CONSTRAINT "mem_team_access_granted_by_fkey" FOREIGN KEY ("granted_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."mem_team_access"
    ADD CONSTRAINT "mem_team_access_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."mem_team_access"
    ADD CONSTRAINT "mem_team_access_well_id_fkey" FOREIGN KEY ("well_id") REFERENCES "public"."mem_wells"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."mem_trajectories"
    ADD CONSTRAINT "mem_trajectories_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."mem_projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."mem_versions"
    ADD CONSTRAINT "mem_versions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."mem_versions"
    ADD CONSTRAINT "mem_versions_mem_id_fkey" FOREIGN KEY ("mem_id") REFERENCES "public"."mems"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."mem_well_data"
    ADD CONSTRAINT "mem_well_data_well_id_fkey" FOREIGN KEY ("well_id") REFERENCES "public"."mem_wells"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."mem_well_logs"
    ADD CONSTRAINT "mem_well_logs_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."mem_projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."mem_wells"
    ADD CONSTRAINT "mem_wells_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."mems"
    ADD CONSTRAINT "mems_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."mems"
    ADD CONSTRAINT "mems_well_id_fkey" FOREIGN KEY ("well_id") REFERENCES "public"."mem_wells"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."mental_health_assessments"
    ADD CONSTRAINT "mental_health_assessments_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."mental_health_assessments"
    ADD CONSTRAINT "mental_health_assessments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."moc_actions"
    ADD CONSTRAINT "moc_actions_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."moc_actions"
    ADD CONSTRAINT "moc_actions_moc_id_fkey" FOREIGN KEY ("moc_id") REFERENCES "public"."moc_records"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."moc_activity_log"
    ADD CONSTRAINT "moc_activity_log_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."moc_activity_log"
    ADD CONSTRAINT "moc_activity_log_moc_id_fkey" FOREIGN KEY ("moc_id") REFERENCES "public"."moc_records"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."moc_approvals"
    ADD CONSTRAINT "moc_approvals_approver_id_fkey" FOREIGN KEY ("approver_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."moc_approvals"
    ADD CONSTRAINT "moc_approvals_moc_id_fkey" FOREIGN KEY ("moc_id") REFERENCES "public"."moc_records"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."moc_comments"
    ADD CONSTRAINT "moc_comments_moc_id_fkey" FOREIGN KEY ("moc_id") REFERENCES "public"."moc_records"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."moc_comments"
    ADD CONSTRAINT "moc_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."moc_impacts"
    ADD CONSTRAINT "moc_impacts_moc_id_fkey" FOREIGN KEY ("moc_id") REFERENCES "public"."moc_records"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."moc_records"
    ADD CONSTRAINT "moc_records_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."moc_records"
    ADD CONSTRAINT "moc_records_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."moc_records"
    ADD CONSTRAINT "moc_records_originator_id_fkey" FOREIGN KEY ("originator_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."moc_records"
    ADD CONSTRAINT "moc_records_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."moc_reviews"
    ADD CONSTRAINT "moc_reviews_moc_id_fkey" FOREIGN KEY ("moc_id") REFERENCES "public"."moc_records"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."moc_reviews"
    ADD CONSTRAINT "moc_reviews_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."model_training_logs"
    ADD CONSTRAINT "model_training_logs_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."model_versions"
    ADD CONSTRAINT "model_versions_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."module_access"
    ADD CONSTRAINT "module_access_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."mud_programs"
    ADD CONSTRAINT "mud_programs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."mud_programs"
    ADD CONSTRAINT "mud_programs_well_id_fkey" FOREIGN KEY ("well_id") REFERENCES "public"."wells"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."offset_surveys"
    ADD CONSTRAINT "offset_surveys_offset_well_id_fkey" FOREIGN KEY ("offset_well_id") REFERENCES "public"."offset_wells"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."offset_surveys"
    ADD CONSTRAINT "offset_surveys_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."offset_wells"
    ADD CONSTRAINT "offset_wells_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."org_members"
    ADD CONSTRAINT "org_members_invited_by_fkey" FOREIGN KEY ("invited_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."org_members"
    ADD CONSTRAINT "org_members_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."org_members"
    ADD CONSTRAINT "org_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."org_settings"
    ADD CONSTRAINT "org_settings_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."organization_apps"
    ADD CONSTRAINT "organization_apps_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."organization_assets"
    ADD CONSTRAINT "organization_assets_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."organization_audit_logs"
    ADD CONSTRAINT "organization_audit_logs_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."organization_audit_logs"
    ADD CONSTRAINT "organization_audit_logs_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."organization_branding"
    ADD CONSTRAINT "organization_branding_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."organization_branding"
    ADD CONSTRAINT "organization_branding_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."organization_members"
    ADD CONSTRAINT "organization_members_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."organization_members"
    ADD CONSTRAINT "organization_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."organization_sites"
    ADD CONSTRAINT "organization_sites_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."organization_sites"
    ADD CONSTRAINT "organization_sites_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."organization_users"
    ADD CONSTRAINT "organization_users_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."organization_users"
    ADD CONSTRAINT "organization_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."organizations"
    ADD CONSTRAINT "organizations_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."payment_audit_log"
    ADD CONSTRAINT "payment_audit_log_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id");



ALTER TABLE ONLY "public"."payment_methods"
    ADD CONSTRAINT "payment_methods_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."payment_notifications"
    ADD CONSTRAINT "payment_notifications_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id");



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_quote_id_fkey" FOREIGN KEY ("quote_id") REFERENCES "public"."quotes"("id");



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id");



ALTER TABLE ONLY "public"."peer_review_audit"
    ADD CONSTRAINT "peer_review_audit_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."peer_review_audit"
    ADD CONSTRAINT "peer_review_audit_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "public"."peer_reviews"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."peer_review_comments"
    ADD CONSTRAINT "peer_review_comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."peer_review_comments"
    ADD CONSTRAINT "peer_review_comments_responded_by_fkey" FOREIGN KEY ("responded_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."peer_review_comments"
    ADD CONSTRAINT "peer_review_comments_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "public"."peer_reviews"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."peer_review_comments"
    ADD CONSTRAINT "peer_review_comments_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."peer_reviews"
    ADD CONSTRAINT "peer_reviews_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."peer_reviews"
    ADD CONSTRAINT "peer_reviews_coordinator_id_fkey" FOREIGN KEY ("coordinator_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."peer_reviews"
    ADD CONSTRAINT "peer_reviews_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."peer_reviews"
    ADD CONSTRAINT "peer_reviews_lead_reviewer_id_fkey" FOREIGN KEY ("lead_reviewer_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."peer_reviews"
    ADD CONSTRAINT "peer_reviews_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."permit_approvals"
    ADD CONSTRAINT "permit_approvals_approver_id_fkey" FOREIGN KEY ("approver_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."permit_approvals"
    ADD CONSTRAINT "permit_approvals_permit_id_fkey" FOREIGN KEY ("permit_id") REFERENCES "public"."work_permits"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."permit_templates"
    ADD CONSTRAINT "permit_templates_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."permit_templates"
    ADD CONSTRAINT "permit_templates_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."petrophysics_activity_log"
    ADD CONSTRAINT "petrophysics_activity_log_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."petrophysics_projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."petrophysics_activity_log"
    ADD CONSTRAINT "petrophysics_activity_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."petrophysics_channels"
    ADD CONSTRAINT "petrophysics_channels_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."petrophysics_channels"
    ADD CONSTRAINT "petrophysics_channels_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."petrophysics_projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."petrophysics_comments"
    ADD CONSTRAINT "petrophysics_comments_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."petrophysics_projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."petrophysics_comments"
    ADD CONSTRAINT "petrophysics_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."petrophysics_correlation_lines"
    ADD CONSTRAINT "petrophysics_correlation_lines_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."petrophysics_projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."petrophysics_correlation_lines"
    ADD CONSTRAINT "petrophysics_correlation_lines_source_well_id_fkey" FOREIGN KEY ("source_well_id") REFERENCES "public"."petrophysics_wells"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."petrophysics_correlation_lines"
    ADD CONSTRAINT "petrophysics_correlation_lines_target_well_id_fkey" FOREIGN KEY ("target_well_id") REFERENCES "public"."petrophysics_wells"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."petrophysics_correlation_lines"
    ADD CONSTRAINT "petrophysics_correlation_lines_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."petrophysics_curves"
    ADD CONSTRAINT "petrophysics_curves_well_id_fkey" FOREIGN KEY ("well_id") REFERENCES "public"."petrophysics_wells"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."petrophysics_markers"
    ADD CONSTRAINT "petrophysics_markers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."petrophysics_markers"
    ADD CONSTRAINT "petrophysics_markers_well_id_fkey" FOREIGN KEY ("well_id") REFERENCES "public"."petrophysics_wells"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."petrophysics_messages"
    ADD CONSTRAINT "petrophysics_messages_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "public"."petrophysics_channels"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."petrophysics_messages"
    ADD CONSTRAINT "petrophysics_messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."petrophysics_monte_carlo_runs"
    ADD CONSTRAINT "petrophysics_monte_carlo_runs_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."petrophysics_projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."petrophysics_monte_carlo_runs"
    ADD CONSTRAINT "petrophysics_monte_carlo_runs_well_id_fkey" FOREIGN KEY ("well_id") REFERENCES "public"."petrophysics_wells"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."petrophysics_notifications"
    ADD CONSTRAINT "petrophysics_notifications_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."petrophysics_projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."petrophysics_notifications"
    ADD CONSTRAINT "petrophysics_notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."petrophysics_project_versions"
    ADD CONSTRAINT "petrophysics_project_versions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."petrophysics_project_versions"
    ADD CONSTRAINT "petrophysics_project_versions_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."petrophysics_projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."petrophysics_projects"
    ADD CONSTRAINT "petrophysics_projects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."petrophysics_qc_reports"
    ADD CONSTRAINT "petrophysics_qc_reports_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."petrophysics_projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."petrophysics_qc_reports"
    ADD CONSTRAINT "petrophysics_qc_reports_well_id_fkey" FOREIGN KEY ("well_id") REFERENCES "public"."petrophysics_wells"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."petrophysics_reserves"
    ADD CONSTRAINT "petrophysics_reserves_well_id_fkey" FOREIGN KEY ("well_id") REFERENCES "public"."petrophysics_wells"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."petrophysics_team_members"
    ADD CONSTRAINT "petrophysics_team_members_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."petrophysics_projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."petrophysics_team_members"
    ADD CONSTRAINT "petrophysics_team_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."petrophysics_wells"
    ADD CONSTRAINT "petrophysics_wells_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."petrophysics_projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."petrophysics_wiki_pages"
    ADD CONSTRAINT "petrophysics_wiki_pages_last_updated_by_fkey" FOREIGN KEY ("last_updated_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."petrophysics_wiki_pages"
    ADD CONSTRAINT "petrophysics_wiki_pages_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."petrophysics_projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."phishing_results"
    ADD CONSTRAINT "phishing_results_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."phishing_results"
    ADD CONSTRAINT "phishing_results_simulation_id_fkey" FOREIGN KEY ("simulation_id") REFERENCES "public"."phishing_simulations"("id");



ALTER TABLE ONLY "public"."phishing_results"
    ADD CONSTRAINT "phishing_results_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."phishing_simulations"
    ADD CONSTRAINT "phishing_simulations_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."pm_app_integrations"
    ADD CONSTRAINT "pm_app_integrations_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."pm_deliverables"
    ADD CONSTRAINT "pm_deliverables_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."pm_deliverables"
    ADD CONSTRAINT "pm_deliverables_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."pm_integration_logs"
    ADD CONSTRAINT "pm_integration_logs_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."pm_integrations"
    ADD CONSTRAINT "pm_integrations_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."pm_resource_assignments"
    ADD CONSTRAINT "pm_resource_assignments_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "public"."pm_resources"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."pm_resource_assignments"
    ADD CONSTRAINT "pm_resource_assignments_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."pm_resources"
    ADD CONSTRAINT "pm_resources_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."portfolio_projects"
    ADD CONSTRAINT "portfolio_projects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."portfolio_scenario_projects"
    ADD CONSTRAINT "portfolio_scenario_projects_portfolio_id_fkey" FOREIGN KEY ("portfolio_id") REFERENCES "public"."portfolios"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."portfolio_scenario_projects"
    ADD CONSTRAINT "portfolio_scenario_projects_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."portfolio_projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."portfolio_scenario_projects"
    ADD CONSTRAINT "portfolio_scenario_projects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."portfolio_snapshots"
    ADD CONSTRAINT "portfolio_snapshots_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."portfolios"
    ADD CONSTRAINT "portfolios_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."positions"
    ADD CONSTRAINT "positions_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id");



ALTER TABLE ONLY "public"."positions"
    ADD CONSTRAINT "positions_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."predictions"
    ADD CONSTRAINT "predictions_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."premium_subscriptions"
    ADD CONSTRAINT "premium_subscriptions_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."pressure_gradients"
    ADD CONSTRAINT "pressure_gradients_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."pressure_gradients"
    ADD CONSTRAINT "pressure_gradients_well_id_fkey" FOREIGN KEY ("well_id") REFERENCES "public"."wells"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."production_data"
    ADD CONSTRAINT "production_data_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."production_surveillance_projects"
    ADD CONSTRAINT "production_surveillance_projects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."project_issues"
    ADD CONSTRAINT "project_issues_linked_risk_id_fkey" FOREIGN KEY ("linked_risk_id") REFERENCES "public"."risks"("id");



ALTER TABLE ONLY "public"."project_issues"
    ADD CONSTRAINT "project_issues_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."project_updates"
    ADD CONSTRAINT "project_updates_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."property_overrides"
    ADD CONSTRAINT "property_overrides_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."expert_mode_sessions"("id");



ALTER TABLE ONLY "public"."pta_files"
    ADD CONSTRAINT "pta_files_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."pta_projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."pta_projects"
    ADD CONSTRAINT "pta_projects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."pta_runs"
    ADD CONSTRAINT "pta_runs_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."pta_projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."pta_telemetry"
    ADD CONSTRAINT "pta_telemetry_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "public"."pta_runs"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."pta_telemetry"
    ADD CONSTRAINT "pta_telemetry_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."purchased_apps"
    ADD CONSTRAINT "purchased_apps_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."purchased_modules"
    ADD CONSTRAINT "purchased_modules_app_uuid_fkey" FOREIGN KEY ("app_uuid") REFERENCES "public"."master_apps"("id");



ALTER TABLE ONLY "public"."purchased_modules"
    ADD CONSTRAINT "purchased_modules_cancelled_by_fkey" FOREIGN KEY ("cancelled_by") REFERENCES "public"."organization_members"("id");



ALTER TABLE ONLY "public"."purchased_modules"
    ADD CONSTRAINT "purchased_modules_module_uuid_fkey" FOREIGN KEY ("module_uuid") REFERENCES "public"."modules"("id");



ALTER TABLE ONLY "public"."purchased_modules"
    ADD CONSTRAINT "purchased_modules_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."purchased_modules"
    ADD CONSTRAINT "purchased_modules_quote_id_fkey" FOREIGN KEY ("quote_id") REFERENCES "public"."quotes"("id");



ALTER TABLE ONLY "public"."pvt_results"
    ADD CONSTRAINT "pvt_results_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."quick_report_media"
    ADD CONSTRAINT "quick_report_media_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "public"."quick_reports"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."quick_report_notifications"
    ADD CONSTRAINT "quick_report_notifications_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."quick_report_notifications"
    ADD CONSTRAINT "quick_report_notifications_quick_report_id_fkey" FOREIGN KEY ("quick_report_id") REFERENCES "public"."quick_reports"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."quick_report_notifications"
    ADD CONSTRAINT "quick_report_notifications_recipient_user_id_fkey" FOREIGN KEY ("recipient_user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."quick_reports"
    ADD CONSTRAINT "quick_reports_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."quick_reports"
    ADD CONSTRAINT "quick_reports_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."quick_reports"
    ADD CONSTRAINT "quick_reports_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."quick_reports"
    ADD CONSTRAINT "quick_reports_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."quick_reports"
    ADD CONSTRAINT "quick_reports_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "public"."organization_sites"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."quick_reports"
    ADD CONSTRAINT "quick_reports_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."departments"("id");



ALTER TABLE ONLY "public"."quickvol_activity_logs"
    ADD CONSTRAINT "quickvol_activity_logs_scenario_id_fkey" FOREIGN KEY ("scenario_id") REFERENCES "public"."saved_quickvol_projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."quickvol_activity_logs"
    ADD CONSTRAINT "quickvol_activity_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."quickvol_api_keys"
    ADD CONSTRAINT "quickvol_api_keys_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."quickvol_comments"
    ADD CONSTRAINT "quickvol_comments_scenario_id_fkey" FOREIGN KEY ("scenario_id") REFERENCES "public"."saved_quickvol_projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."quickvol_comments"
    ADD CONSTRAINT "quickvol_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."quickvol_generated_reports"
    ADD CONSTRAINT "quickvol_generated_reports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."quickvol_integration_logs"
    ADD CONSTRAINT "quickvol_integration_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."quickvol_ml_models"
    ADD CONSTRAINT "quickvol_ml_models_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."quickvol_predictions"
    ADD CONSTRAINT "quickvol_predictions_model_id_fkey" FOREIGN KEY ("model_id") REFERENCES "public"."quickvol_ml_models"("id");



ALTER TABLE ONLY "public"."quickvol_predictions"
    ADD CONSTRAINT "quickvol_predictions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."quickvol_report_templates"
    ADD CONSTRAINT "quickvol_report_templates_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."quickvol_validation_runs"
    ADD CONSTRAINT "quickvol_validation_runs_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."saved_quickvol_projects"("id");



ALTER TABLE ONLY "public"."quickvol_validation_runs"
    ADD CONSTRAINT "quickvol_validation_runs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."quickvol_versions"
    ADD CONSTRAINT "quickvol_versions_scenario_id_fkey" FOREIGN KEY ("scenario_id") REFERENCES "public"."saved_quickvol_projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."quickvol_versions"
    ADD CONSTRAINT "quickvol_versions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."quickvol_webhooks"
    ADD CONSTRAINT "quickvol_webhooks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."quickvol_workspace_members"
    ADD CONSTRAINT "quickvol_workspace_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."quickvol_workspace_members"
    ADD CONSTRAINT "quickvol_workspace_members_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."quickvol_workspaces"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."quickvol_workspaces"
    ADD CONSTRAINT "quickvol_workspaces_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."quotes"
    ADD CONSTRAINT "quotes_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."quotes"
    ADD CONSTRAINT "quotes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."rb_cases"
    ADD CONSTRAINT "rb_cases_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."rb_cases"
    ADD CONSTRAINT "rb_cases_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."rb_production_data"
    ADD CONSTRAINT "rb_production_data_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "public"."rb_cases"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."rb_results"
    ADD CONSTRAINT "rb_results_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "public"."rb_cases"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."rb_results"
    ADD CONSTRAINT "rb_results_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "public"."rb_runs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."rb_run_configs"
    ADD CONSTRAINT "rb_run_configs_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "public"."rb_cases"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."rb_runs"
    ADD CONSTRAINT "rb_runs_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "public"."rb_cases"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."rb_runs"
    ADD CONSTRAINT "rb_runs_parent_run_id_fkey" FOREIGN KEY ("parent_run_id") REFERENCES "public"."rb_runs"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."rb_runs"
    ADD CONSTRAINT "rb_runs_run_config_id_fkey" FOREIGN KEY ("run_config_id") REFERENCES "public"."rb_run_configs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."recommendations"
    ADD CONSTRAINT "recommendations_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."regulatory_authorities"
    ADD CONSTRAINT "regulatory_authorities_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."regulatory_obligations"
    ADD CONSTRAINT "regulatory_obligations_authority_id_fkey" FOREIGN KEY ("authority_id") REFERENCES "public"."regulatory_authorities"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."regulatory_obligations"
    ADD CONSTRAINT "regulatory_obligations_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."regulatory_obligations"
    ADD CONSTRAINT "regulatory_obligations_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."renewal_audit_log"
    ADD CONSTRAINT "renewal_audit_log_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."renewal_audit_log"
    ADD CONSTRAINT "renewal_audit_log_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id");



ALTER TABLE ONLY "public"."renewal_notifications"
    ADD CONSTRAINT "renewal_notifications_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."renewal_notifications"
    ADD CONSTRAINT "renewal_notifications_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id");



ALTER TABLE ONLY "public"."renewal_reminders"
    ADD CONSTRAINT "renewal_reminders_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."report_shares"
    ADD CONSTRAINT "report_shares_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "public"."incidents"("id");



ALTER TABLE ONLY "public"."report_shares"
    ADD CONSTRAINT "report_shares_shared_by_fkey" FOREIGN KEY ("shared_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."reports"
    ADD CONSTRAINT "reports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reservoir_activities"
    ADD CONSTRAINT "reservoir_activities_reservoir_id_fkey" FOREIGN KEY ("reservoir_id") REFERENCES "public"."reservoirs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reservoir_activities"
    ADD CONSTRAINT "reservoir_activities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."reservoir_analyses"
    ADD CONSTRAINT "reservoir_analyses_reservoir_id_fkey" FOREIGN KEY ("reservoir_id") REFERENCES "public"."reservoirs"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reservoir_analyses"
    ADD CONSTRAINT "reservoir_analyses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."reservoircalc_projects"
    ADD CONSTRAINT "reservoircalc_projects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."reservoirs"
    ADD CONSTRAINT "reservoirs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."resources"
    ADD CONSTRAINT "resources_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."retraining_jobs"
    ADD CONSTRAINT "retraining_jobs_new_model_version_id_fkey" FOREIGN KEY ("new_model_version_id") REFERENCES "public"."model_versions"("id");



ALTER TABLE ONLY "public"."retraining_jobs"
    ADD CONSTRAINT "retraining_jobs_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."return_to_work_plans"
    ADD CONSTRAINT "return_to_work_plans_incident_id_fkey" FOREIGN KEY ("incident_id") REFERENCES "public"."incidents"("id");



ALTER TABLE ONLY "public"."return_to_work_plans"
    ADD CONSTRAINT "return_to_work_plans_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."return_to_work_plans"
    ADD CONSTRAINT "return_to_work_plans_supervisor_id_fkey" FOREIGN KEY ("supervisor_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."return_to_work_plans"
    ADD CONSTRAINT "return_to_work_plans_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."risk_actions"
    ADD CONSTRAINT "risk_actions_action_owner_id_fkey" FOREIGN KEY ("action_owner_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."risk_actions"
    ADD CONSTRAINT "risk_actions_risk_id_fkey" FOREIGN KEY ("risk_id") REFERENCES "public"."risk_register"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."risk_activity_log"
    ADD CONSTRAINT "risk_activity_log_risk_id_fkey" FOREIGN KEY ("risk_id") REFERENCES "public"."risk_register"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."risk_activity_log"
    ADD CONSTRAINT "risk_activity_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."risk_attachments"
    ADD CONSTRAINT "risk_attachments_risk_id_fkey" FOREIGN KEY ("risk_id") REFERENCES "public"."risk_register"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."risk_attachments"
    ADD CONSTRAINT "risk_attachments_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."risk_comments"
    ADD CONSTRAINT "risk_comments_risk_id_fkey" FOREIGN KEY ("risk_id") REFERENCES "public"."risk_register"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."risk_comments"
    ADD CONSTRAINT "risk_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."risk_kris"
    ADD CONSTRAINT "risk_kris_risk_id_fkey" FOREIGN KEY ("risk_id") REFERENCES "public"."risk_register"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."risk_links"
    ADD CONSTRAINT "risk_links_source_risk_id_fkey" FOREIGN KEY ("source_risk_id") REFERENCES "public"."risk_register"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."risk_links"
    ADD CONSTRAINT "risk_links_target_risk_id_fkey" FOREIGN KEY ("target_risk_id") REFERENCES "public"."risk_register"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."risk_mitigation_actions"
    ADD CONSTRAINT "risk_mitigation_actions_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."risk_mitigation_actions"
    ADD CONSTRAINT "risk_mitigation_actions_risk_id_fkey" FOREIGN KEY ("risk_id") REFERENCES "public"."risk_register"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."risk_register"
    ADD CONSTRAINT "risk_register_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."risk_register"
    ADD CONSTRAINT "risk_register_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."risk_register"
    ADD CONSTRAINT "risk_register_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."risk_register_snapshots"
    ADD CONSTRAINT "risk_register_snapshots_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."risk_register_snapshots"
    ADD CONSTRAINT "risk_register_snapshots_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."risk_reviews"
    ADD CONSTRAINT "risk_reviews_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."risk_reviews"
    ADD CONSTRAINT "risk_reviews_risk_id_fkey" FOREIGN KEY ("risk_id") REFERENCES "public"."risk_register"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."risk_scenarios"
    ADD CONSTRAINT "risk_scenarios_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."risk_tags"
    ADD CONSTRAINT "risk_tags_risk_id_fkey" FOREIGN KEY ("risk_id") REFERENCES "public"."risk_register"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."risks"
    ADD CONSTRAINT "risks_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."role_permissions"
    ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."role_permissions"
    ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."rto_connections"
    ADD CONSTRAINT "rto_connections_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."rto_connections"
    ADD CONSTRAINT "rto_connections_well_id_fkey" FOREIGN KEY ("well_id") REFERENCES "public"."wells"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."rto_projects"
    ADD CONSTRAINT "rto_projects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."rto_settings"
    ADD CONSTRAINT "rto_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."rto_settings"
    ADD CONSTRAINT "rto_settings_well_id_fkey" FOREIGN KEY ("well_id") REFERENCES "public"."wells"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."safety_audits"
    ADD CONSTRAINT "safety_audits_auditor_id_fkey" FOREIGN KEY ("auditor_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."safety_audits"
    ADD CONSTRAINT "safety_audits_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."safety_audits"
    ADD CONSTRAINT "safety_audits_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "public"."organization_sites"("id");



ALTER TABLE ONLY "public"."safety_moment_downloads"
    ADD CONSTRAINT "safety_moment_downloads_moment_id_fkey" FOREIGN KEY ("moment_id") REFERENCES "public"."safety_moments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."safety_moment_downloads"
    ADD CONSTRAINT "safety_moment_downloads_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."safety_moment_shares"
    ADD CONSTRAINT "safety_moment_shares_moment_id_fkey" FOREIGN KEY ("moment_id") REFERENCES "public"."safety_moments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."safety_moment_shares"
    ADD CONSTRAINT "safety_moment_shares_shared_by_fkey" FOREIGN KEY ("shared_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."safety_moment_views"
    ADD CONSTRAINT "safety_moment_views_moment_id_fkey" FOREIGN KEY ("moment_id") REFERENCES "public"."safety_moments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."safety_moment_views"
    ADD CONSTRAINT "safety_moment_views_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."safety_moments"
    ADD CONSTRAINT "safety_moments_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."safety_moment_categories"("id");



ALTER TABLE ONLY "public"."safety_points"
    ADD CONSTRAINT "safety_points_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."safety_points"
    ADD CONSTRAINT "safety_points_report_id_fkey" FOREIGN KEY ("report_id") REFERENCES "public"."incidents"("id");



ALTER TABLE ONLY "public"."safety_points"
    ADD CONSTRAINT "safety_points_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."safety_scores"
    ADD CONSTRAINT "safety_scores_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."saved_casing_design_projects"
    ADD CONSTRAINT "saved_casing_design_projects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."saved_compressor_pump_projects"
    ADD CONSTRAINT "saved_compressor_pump_projects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."saved_dca_projects"
    ADD CONSTRAINT "saved_dca_projects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."saved_drilling_fluids_projects"
    ADD CONSTRAINT "saved_drilling_fluids_projects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."saved_heat_exchanger_projects"
    ADD CONSTRAINT "saved_heat_exchanger_projects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."saved_mbal_projects"
    ADD CONSTRAINT "saved_mbal_projects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."saved_nodal_analysis_projects"
    ADD CONSTRAINT "saved_nodal_analysis_projects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."saved_petrophysics_projects"
    ADD CONSTRAINT "saved_petrophysics_projects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."saved_pipeline_sizer_projects"
    ADD CONSTRAINT "saved_pipeline_sizer_projects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."saved_pvt_projects"
    ADD CONSTRAINT "saved_pvt_projects_reservoir_id_fkey" FOREIGN KEY ("reservoir_id") REFERENCES "public"."reservoirs"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."saved_pvt_projects"
    ADD CONSTRAINT "saved_pvt_projects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."saved_quickvol_projects"
    ADD CONSTRAINT "saved_quickvol_projects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."saved_quickvol_projects"
    ADD CONSTRAINT "saved_quickvol_projects_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."quickvol_workspaces"("id");



ALTER TABLE ONLY "public"."saved_relief_projects"
    ADD CONSTRAINT "saved_relief_projects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."saved_report_autopilot_projects"
    ADD CONSTRAINT "saved_report_autopilot_projects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."saved_reports"
    ADD CONSTRAINT "saved_reports_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."saved_reports"
    ADD CONSTRAINT "saved_reports_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."saved_reservoir_balance_projects"
    ADD CONSTRAINT "saved_reservoir_balance_projects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."saved_well_cost_iq_projects"
    ADD CONSTRAINT "saved_well_cost_iq_projects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."saved_well_cost_projects"
    ADD CONSTRAINT "saved_well_cost_projects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."scenario_comparisons"
    ADD CONSTRAINT "scenario_comparisons_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."scheduled_safety_moments"
    ADD CONSTRAINT "scheduled_safety_moments_moment_id_fkey" FOREIGN KEY ("moment_id") REFERENCES "public"."safety_moments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."scheduled_safety_moments"
    ADD CONSTRAINT "scheduled_safety_moments_scheduled_by_fkey" FOREIGN KEY ("scheduled_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."scheduled_safety_moments"
    ADD CONSTRAINT "scheduled_safety_moments_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."departments"("id");



ALTER TABLE ONLY "public"."security_incidents"
    ADD CONSTRAINT "security_incidents_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."security_incidents"
    ADD CONSTRAINT "security_incidents_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."security_incidents"
    ADD CONSTRAINT "security_incidents_reported_by_fkey" FOREIGN KEY ("reported_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."security_knowledge_assessments"
    ADD CONSTRAINT "security_knowledge_assessments_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."security_knowledge_assessments"
    ADD CONSTRAINT "security_knowledge_assessments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."security_profiles"
    ADD CONSTRAINT "security_profiles_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."security_profiles"
    ADD CONSTRAINT "security_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."security_training"
    ADD CONSTRAINT "security_training_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."security_training"
    ADD CONSTRAINT "security_training_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."shared_data_registry"
    ADD CONSTRAINT "shared_data_registry_reservoir_id_fkey" FOREIGN KEY ("reservoir_id") REFERENCES "public"."reservoirs"("id");



ALTER TABLE ONLY "public"."shared_data_registry"
    ADD CONSTRAINT "shared_data_registry_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."shared_data_registry"
    ADD CONSTRAINT "shared_data_registry_well_id_fkey" FOREIGN KEY ("well_id") REFERENCES "public"."wells"("id");



ALTER TABLE ONLY "public"."sim_cases"
    ADD CONSTRAINT "sim_cases_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."sim_projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sim_cases"
    ADD CONSTRAINT "sim_cases_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."sim_projects"
    ADD CONSTRAINT "sim_projects_reservoir_id_fkey" FOREIGN KEY ("reservoir_id") REFERENCES "public"."reservoirs"("id");



ALTER TABLE ONLY "public"."sim_projects"
    ADD CONSTRAINT "sim_projects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."sip_faults"
    ADD CONSTRAINT "sip_faults_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."sip_faults"
    ADD CONSTRAINT "sip_faults_version_id_fkey" FOREIGN KEY ("version_id") REFERENCES "public"."sip_versions"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."sip_faults"
    ADD CONSTRAINT "sip_faults_volume_id_fkey" FOREIGN KEY ("volume_id") REFERENCES "public"."sip_volumes"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."sip_horizons"
    ADD CONSTRAINT "sip_horizons_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."sip_horizons"
    ADD CONSTRAINT "sip_horizons_version_id_fkey" FOREIGN KEY ("version_id") REFERENCES "public"."sip_versions"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."sip_horizons"
    ADD CONSTRAINT "sip_horizons_volume_id_fkey" FOREIGN KEY ("volume_id") REFERENCES "public"."sip_volumes"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."sip_jobs"
    ADD CONSTRAINT "sip_jobs_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."sip_jobs"
    ADD CONSTRAINT "sip_jobs_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."sip_projects"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."sip_projects"
    ADD CONSTRAINT "sip_projects_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."sip_projects"
    ADD CONSTRAINT "sip_projects_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."sip_surveys"
    ADD CONSTRAINT "sip_surveys_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."sip_surveys"
    ADD CONSTRAINT "sip_surveys_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."sip_projects"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."sip_uploads"
    ADD CONSTRAINT "sip_uploads_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."sip_uploads"
    ADD CONSTRAINT "sip_uploads_survey_id_fkey" FOREIGN KEY ("survey_id") REFERENCES "public"."sip_surveys"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."sip_versions"
    ADD CONSTRAINT "sip_versions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."sip_versions"
    ADD CONSTRAINT "sip_versions_parent_version_id_fkey" FOREIGN KEY ("parent_version_id") REFERENCES "public"."sip_versions"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."sip_versions"
    ADD CONSTRAINT "sip_versions_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "public"."sip_workspaces"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."sip_volumes"
    ADD CONSTRAINT "sip_volumes_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."sip_volumes"
    ADD CONSTRAINT "sip_volumes_source_upload_id_fkey" FOREIGN KEY ("source_upload_id") REFERENCES "public"."sip_uploads"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."sip_volumes"
    ADD CONSTRAINT "sip_volumes_survey_id_fkey" FOREIGN KEY ("survey_id") REFERENCES "public"."sip_surveys"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."sip_workspaces"
    ADD CONSTRAINT "sip_workspaces_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."sip_workspaces"
    ADD CONSTRAINT "sip_workspaces_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."sip_projects"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."site_locations"
    ADD CONSTRAINT "site_locations_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."site_locations"
    ADD CONSTRAINT "site_locations_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."site_locations"
    ADD CONSTRAINT "site_locations_parent_location_id_fkey" FOREIGN KEY ("parent_location_id") REFERENCES "public"."site_locations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."site_locations"
    ADD CONSTRAINT "site_locations_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "public"."organization_sites"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."sites"
    ADD CONSTRAINT "sites_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."ss_assets"
    ADD CONSTRAINT "ss_assets_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."ss_assets"
    ADD CONSTRAINT "ss_assets_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."ss_projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ss_events"
    ADD CONSTRAINT "ss_events_actor_fkey" FOREIGN KEY ("actor") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."ss_events"
    ADD CONSTRAINT "ss_events_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."ss_events"
    ADD CONSTRAINT "ss_events_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."ss_projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ss_interpretations"
    ADD CONSTRAINT "ss_interpretations_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."ss_interpretations"
    ADD CONSTRAINT "ss_interpretations_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."ss_projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ss_interpretations"
    ADD CONSTRAINT "ss_interpretations_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "public"."ss_sections"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ss_jobs"
    ADD CONSTRAINT "ss_jobs_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."ss_jobs"
    ADD CONSTRAINT "ss_jobs_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."ss_projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ss_projects"
    ADD CONSTRAINT "ss_projects_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."ss_sections"
    ADD CONSTRAINT "ss_sections_volume_id_fkey" FOREIGN KEY ("volume_id") REFERENCES "public"."ss_volumes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ss_styles"
    ADD CONSTRAINT "ss_styles_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."ss_styles"
    ADD CONSTRAINT "ss_styles_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."ss_projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ss_workflow_runs"
    ADD CONSTRAINT "ss_workflow_runs_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "public"."ss_workflows"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ss_workflows"
    ADD CONSTRAINT "ss_workflows_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."ss_projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."stress_overrides"
    ADD CONSTRAINT "stress_overrides_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."expert_mode_sessions"("id");



ALTER TABLE ONLY "public"."studio_access_tokens"
    ADD CONSTRAINT "studio_access_tokens_studio_user_id_fkey" FOREIGN KEY ("studio_user_id") REFERENCES "public"."studio_users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."subscription_events"
    ADD CONSTRAINT "subscription_events_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."subscription_events"
    ADD CONSTRAINT "subscription_events_performed_by_fkey" FOREIGN KEY ("performed_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."subscription_usage"
    ADD CONSTRAINT "subscription_usage_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_quote_id_fkey" FOREIGN KEY ("quote_id") REFERENCES "public"."quotes"("id");



ALTER TABLE ONLY "public"."super_admin_impersonation_log"
    ADD CONSTRAINT "super_admin_impersonation_log_impersonated_org_id_fkey" FOREIGN KEY ("impersonated_org_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."super_admin_impersonation_log"
    ADD CONSTRAINT "super_admin_impersonation_log_impersonated_user_id_fkey" FOREIGN KEY ("impersonated_user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."super_admin_impersonation_log"
    ADD CONSTRAINT "super_admin_impersonation_log_super_admin_id_fkey" FOREIGN KEY ("super_admin_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."support_ticket_comments"
    ADD CONSTRAINT "support_ticket_comments_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "public"."support_tickets"("id");



ALTER TABLE ONLY "public"."support_ticket_comments"
    ADD CONSTRAINT "support_ticket_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."support_tickets"
    ADD CONSTRAINT "support_tickets_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."support_tickets"
    ADD CONSTRAINT "support_tickets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."surveys"
    ADD CONSTRAINT "surveys_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."surveys"
    ADD CONSTRAINT "surveys_well_id_fkey" FOREIGN KEY ("well_id") REFERENCES "public"."wells"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."tasks"
    ADD CONSTRAINT "tasks_parent_task_id_fkey" FOREIGN KEY ("parent_task_id") REFERENCES "public"."tasks"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."tasks"
    ADD CONSTRAINT "tasks_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."team_app_access"
    ADD CONSTRAINT "team_app_access_granted_by_fkey" FOREIGN KEY ("granted_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."team_app_access"
    ADD CONSTRAINT "team_app_access_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."team_members"
    ADD CONSTRAINT "team_members_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."team_members"
    ADD CONSTRAINT "team_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."teams"
    ADD CONSTRAINT "teams_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."teams"
    ADD CONSTRAINT "teams_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."template_usage"
    ADD CONSTRAINT "template_usage_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."template_usage"
    ADD CONSTRAINT "template_usage_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "public"."templates"("id");



ALTER TABLE ONLY "public"."templates"
    ADD CONSTRAINT "templates_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."tenants"
    ADD CONSTRAINT "tenants_partner_id_fkey" FOREIGN KEY ("partner_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."torque_drag_projects"
    ADD CONSTRAINT "torque_drag_projects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."torque_drag_runs"
    ADD CONSTRAINT "torque_drag_runs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."torque_drag_runs"
    ADD CONSTRAINT "torque_drag_runs_well_id_fkey" FOREIGN KEY ("well_id") REFERENCES "public"."wells"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trajectory_plans"
    ADD CONSTRAINT "trajectory_plans_target_id_fkey" FOREIGN KEY ("target_id") REFERENCES "public"."well_targets"("id");



ALTER TABLE ONLY "public"."trajectory_plans"
    ADD CONSTRAINT "trajectory_plans_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trajectory_plans"
    ADD CONSTRAINT "trajectory_plans_well_id_fkey" FOREIGN KEY ("well_id") REFERENCES "public"."wells"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id");



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."transactions"
    ADD CONSTRAINT "transactions_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."trend_analysis"
    ADD CONSTRAINT "trend_analysis_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."usage_metrics"
    ADD CONSTRAINT "usage_metrics_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_activity_logs"
    ADD CONSTRAINT "user_activity_logs_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."user_activity_logs"
    ADD CONSTRAINT "user_activity_logs_super_admin_id_fkey" FOREIGN KEY ("super_admin_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."user_activity_logs"
    ADD CONSTRAINT "user_activity_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."user_app_access"
    ADD CONSTRAINT "user_app_access_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_badges"
    ADD CONSTRAINT "user_badges_badge_id_fkey" FOREIGN KEY ("badge_id") REFERENCES "public"."badge_definitions"("id");



ALTER TABLE ONLY "public"."user_badges"
    ADD CONSTRAINT "user_badges_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."user_badges"
    ADD CONSTRAINT "user_badges_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."user_currency_preference"
    ADD CONSTRAINT "user_currency_preference_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."user_notifications"
    ADD CONSTRAINT "user_notifications_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."user_notifications"
    ADD CONSTRAINT "user_notifications_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."user_points_summary"
    ADD CONSTRAINT "user_points_summary_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."user_points_summary"
    ADD CONSTRAINT "user_points_summary_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."user_positions"
    ADD CONSTRAINT "user_positions_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id");



ALTER TABLE ONLY "public"."user_positions"
    ADD CONSTRAINT "user_positions_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."user_positions"
    ADD CONSTRAINT "user_positions_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "public"."positions"("id");



ALTER TABLE ONLY "public"."user_positions"
    ADD CONSTRAINT "user_positions_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "public"."organization_sites"("id");



ALTER TABLE ONLY "public"."user_positions"
    ADD CONSTRAINT "user_positions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."user_preferences"
    ADD CONSTRAINT "user_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."user_saved_moments"
    ADD CONSTRAINT "user_saved_moments_moment_id_fkey" FOREIGN KEY ("moment_id") REFERENCES "public"."safety_moments"("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."vulnerabilities"
    ADD CONSTRAINT "vulnerabilities_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."waterflood_projects"
    ADD CONSTRAINT "waterflood_projects_reservoir_id_fkey" FOREIGN KEY ("reservoir_id") REFERENCES "public"."reservoirs"("id");



ALTER TABLE ONLY "public"."waterflood_projects"
    ADD CONSTRAINT "waterflood_projects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."webhooks"
    ADD CONSTRAINT "webhooks_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."well_correlation_projects"
    ADD CONSTRAINT "well_correlation_projects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."well_correlation_wells"
    ADD CONSTRAINT "well_correlation_wells_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."well_correlation_projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."well_correlation_wells"
    ADD CONSTRAINT "well_correlation_wells_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."well_targets"
    ADD CONSTRAINT "well_targets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."well_targets"
    ADD CONSTRAINT "well_targets_well_id_fkey" FOREIGN KEY ("well_id") REFERENCES "public"."wells"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."wellbore_flow_projects"
    ADD CONSTRAINT "wellbore_flow_projects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."wells"
    ADD CONSTRAINT "wells_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."wells"
    ADD CONSTRAINT "wells_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."work_permits"
    ADD CONSTRAINT "work_permits_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."work_permits"
    ADD CONSTRAINT "work_permits_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."work_permits"
    ADD CONSTRAINT "work_permits_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id");



ALTER TABLE ONLY "public"."work_permits"
    ADD CONSTRAINT "work_permits_requested_by_fkey" FOREIGN KEY ("requested_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."work_permits"
    ADD CONSTRAINT "work_permits_supervisor_id_fkey" FOREIGN KEY ("supervisor_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."workflow_executions"
    ADD CONSTRAINT "workflow_executions_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "public"."workflows"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."workflow_steps"
    ADD CONSTRAINT "workflow_steps_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "public"."workflows"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."workflows"
    ADD CONSTRAINT "workflows_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."workflows"
    ADD CONSTRAINT "workflows_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id");



CREATE POLICY "Assignees and admins can update actions" ON "hse"."actions" FOR UPDATE USING ((("assigned_to" = "auth"."uid"()) OR ("organization_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE (("organization_users"."user_id" = "auth"."uid"()) AND ("organization_users"."user_role" = ANY (ARRAY['org_admin'::"text", 'super_admin'::"text", 'manager'::"text"])))))));



CREATE POLICY "Creators and admins can update reports" ON "hse"."reports" FOR UPDATE USING ((("created_by" = "auth"."uid"()) OR ("organization_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE (("organization_users"."user_id" = "auth"."uid"()) AND ("organization_users"."user_role" = ANY (ARRAY['org_admin'::"text", 'super_admin'::"text", 'manager'::"text"])))))));



CREATE POLICY "Only admins can modify roles" ON "hse"."role_definitions" USING (("organization_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE (("organization_users"."user_id" = "auth"."uid"()) AND ("organization_users"."role" = 'admin'::"text")))));



CREATE POLICY "Only admins can modify subscription" ON "hse"."subscriptions" USING (("organization_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE (("organization_users"."user_id" = "auth"."uid"()) AND ("organization_users"."role" = 'admin'::"text")))));



CREATE POLICY "Only admins can view audit logs" ON "hse"."audit_log" FOR SELECT USING (("organization_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE (("organization_users"."user_id" = "auth"."uid"()) AND ("organization_users"."role" = 'admin'::"text")))));



CREATE POLICY "Org Access Alerts" ON "hse"."contractor_alerts" USING ((("org_id")::"text" = "current_setting"('app.current_org_id'::"text", true)));



CREATE POLICY "Org Access Assessments" ON "hse"."competency_assessments" USING (("org_id" = "public"."get_my_organization_id"()));



CREATE POLICY "Org Access Assignments" ON "hse"."contractor_site_assignments" USING ((("org_id")::"text" = "current_setting"('app.current_org_id'::"text", true)));



CREATE POLICY "Org Access Attendance" ON "hse"."training_attendance" USING (("org_id" = "public"."get_my_organization_id"()));



CREATE POLICY "Org Access Checklists" ON "hse"."compliance_checklists" USING ((("org_id")::"text" = "current_setting"('app.current_org_id'::"text", true)));



CREATE POLICY "Org Access Comms" ON "hse"."contractor_communications" USING ((("org_id")::"text" = "current_setting"('app.current_org_id'::"text", true)));



CREATE POLICY "Org Access Communications" ON "hse"."team_communications" USING (("org_id" = ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"())
 LIMIT 1)));



CREATE POLICY "Org Access Documents" ON "hse"."contractor_documents" USING ((("org_id")::"text" = "current_setting"('app.current_org_id'::"text", true)));



CREATE POLICY "Org Access Feedback" ON "hse"."training_feedback" USING (("org_id" = "public"."get_my_organization_id"()));



CREATE POLICY "Org Access Framework" ON "hse"."competency_framework" USING (("org_id" = "public"."get_my_organization_id"()));



CREATE POLICY "Org Access Incidents" ON "hse"."contractor_incidents" USING ((("org_id")::"text" = "current_setting"('app.current_org_id'::"text", true)));



CREATE POLICY "Org Access Medical" ON "hse"."contractor_medical_records" USING ((("org_id")::"text" = "current_setting"('app.current_org_id'::"text", true)));



CREATE POLICY "Org Access Members" ON "hse"."team_members" USING (("org_id" = ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"())
 LIMIT 1)));



CREATE POLICY "Org Access Performance" ON "hse"."team_performance" USING (("org_id" = ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"())
 LIMIT 1)));



CREATE POLICY "Org Access Programs" ON "hse"."training_programs" USING (("org_id" = "public"."get_my_organization_id"()));



CREATE POLICY "Org Access Project Members" ON "hse"."project_members" USING (("org_id" = ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"())
 LIMIT 1)));



CREATE POLICY "Org Access Projects" ON "hse"."team_projects" USING (("org_id" = ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"())
 LIMIT 1)));



CREATE POLICY "Org Access Records" ON "hse"."training_records" USING (("org_id" = "public"."get_my_organization_id"()));



CREATE POLICY "Org Access Resources" ON "hse"."team_resources" USING (("org_id" = ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"())
 LIMIT 1)));



CREATE POLICY "Org Access Reviews" ON "hse"."contractor_reviews" USING ((("org_id")::"text" = "current_setting"('app.current_org_id'::"text", true)));



CREATE POLICY "Org Access Roles" ON "hse"."roles" USING (("org_id" = ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"())
 LIMIT 1)));



CREATE POLICY "Org Access Schedule" ON "hse"."training_schedule" USING (("org_id" = "public"."get_my_organization_id"()));



CREATE POLICY "Org Access Tasks" ON "hse"."team_tasks" USING (("org_id" = ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"())
 LIMIT 1)));



CREATE POLICY "Org Access Teams" ON "hse"."teams" USING (("org_id" = ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"())
 LIMIT 1)));



CREATE POLICY "Org Access Training" ON "hse"."training_records" USING ((("org_id")::"text" = "current_setting"('app.current_org_id'::"text", true)));



CREATE POLICY "Org members can insert access logs" ON "hse"."access_logs" FOR INSERT WITH CHECK (true);



CREATE POLICY "Org members can insert actions" ON "hse"."actions" FOR INSERT WITH CHECK (("organization_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Org members can insert audit logs" ON "hse"."audit_logs" FOR INSERT WITH CHECK (true);



CREATE POLICY "Org members can insert environmental records" ON "hse"."environmental_records" FOR INSERT WITH CHECK (("auth"."uid"() = "created_by"));



CREATE POLICY "Org members can insert exposure logs" ON "hse"."exposure_log" FOR INSERT WITH CHECK (("auth"."uid"() = "created_by"));



CREATE POLICY "Org members can insert health records" ON "hse"."health_records" FOR INSERT WITH CHECK (("auth"."uid"() = "created_by"));



CREATE POLICY "Org members can insert reports" ON "hse"."reports" FOR INSERT WITH CHECK (("organization_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Org members can insert security incidents" ON "hse"."security_incidents" FOR INSERT WITH CHECK (("auth"."uid"() = "created_by"));



CREATE POLICY "Org members can insert waste records" ON "hse"."waste_management" FOR INSERT WITH CHECK (("auth"."uid"() = "created_by"));



CREATE POLICY "Org members can read access logs" ON "hse"."access_logs" FOR SELECT USING (("org_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Org members can read audit logs" ON "hse"."audit_logs" FOR SELECT USING (("org_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Org members can read environmental records" ON "hse"."environmental_records" FOR SELECT USING (("org_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Org members can read exposure logs" ON "hse"."exposure_log" FOR SELECT USING (("org_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Org members can read health records" ON "hse"."health_records" FOR SELECT USING (("org_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Org members can read security incidents" ON "hse"."security_incidents" FOR SELECT USING (("org_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Org members can read waste records" ON "hse"."waste_management" FOR SELECT USING (("org_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Org members can view actions" ON "hse"."actions" FOR SELECT USING (("organization_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Org members can view reports" ON "hse"."reports" FOR SELECT USING (("organization_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can create actions" ON "hse"."actions" FOR INSERT WITH CHECK (("organization_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can create reports for their org" ON "hse"."reports" FOR INSERT WITH CHECK (("organization_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can create reports in their org" ON "hse"."reports" FOR INSERT WITH CHECK ("hse"."has_org_access"("organization_id"));



CREATE POLICY "Users can create/update actions in their org" ON "hse"."actions" USING ("hse"."has_org_access"("organization_id"));



CREATE POLICY "Users can insert fire drills for their org" ON "hse"."fire_drills" FOR INSERT WITH CHECK (("org_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can insert fire equipment for their org" ON "hse"."fire_equipment" FOR INSERT WITH CHECK (("org_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can insert fire records for their org" ON "hse"."fire_safety_records" FOR INSERT WITH CHECK (("org_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can insert reports for their org" ON "hse"."reports" FOR INSERT WITH CHECK (("organization_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can insert risks for their org" ON "hse"."risk_register" FOR INSERT WITH CHECK (("org_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can insert spill records for their org" ON "hse"."spill_records" FOR INSERT WITH CHECK (("org_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can insert spill response for their org" ON "hse"."spill_response" FOR INSERT WITH CHECK (("org_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can manage actions for their org" ON "hse"."actions" USING (("organization_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can manage audit findings for their organization" ON "hse"."audit_findings" USING (("org_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can manage audit schedule for their organization" ON "hse"."audit_schedule" USING (("org_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can manage competency records for their organization" ON "hse"."competency_records" USING (("org_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can manage contractors for their organization" ON "hse"."contractors" USING (("org_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can manage external reports for their organization" ON "hse"."external_reports" USING (("org_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can manage inductions for their organization" ON "hse"."safety_inductions" USING (("org_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can manage internal audits for their organization" ON "hse"."internal_audits" USING (("org_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can update actions" ON "hse"."actions" FOR UPDATE USING (("organization_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can update reports for their org" ON "hse"."reports" FOR UPDATE USING (("organization_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can update reports in their org" ON "hse"."reports" FOR UPDATE USING ("hse"."has_org_access"("organization_id"));



CREATE POLICY "Users can update risks for their org" ON "hse"."risk_register" FOR UPDATE USING (("org_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can upload attachments for reports in their org" ON "hse"."report_attachments" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "hse"."reports"
  WHERE (("reports"."id" = "report_attachments"."report_id") AND "hse"."has_org_access"("reports"."organization_id")))));



CREATE POLICY "Users can view actions for their org" ON "hse"."actions" FOR SELECT USING (("organization_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can view actions in their org" ON "hse"."actions" FOR SELECT USING ("hse"."has_org_access"("organization_id"));



CREATE POLICY "Users can view attachments in their org" ON "hse"."report_attachments" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "hse"."reports"
  WHERE (("reports"."id" = "report_attachments"."report_id") AND "hse"."has_org_access"("reports"."organization_id")))));



CREATE POLICY "Users can view audit logs for their org" ON "hse"."audit_log" FOR SELECT USING (("organization_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can view fire drills for their org" ON "hse"."fire_drills" FOR SELECT USING (("org_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can view fire equipment for their org" ON "hse"."fire_equipment" FOR SELECT USING (("org_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can view fire records for their org" ON "hse"."fire_safety_records" FOR SELECT USING (("org_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can view reports for their org" ON "hse"."reports" FOR SELECT USING (("organization_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can view reports in their org" ON "hse"."reports" FOR SELECT USING ("hse"."has_org_access"("organization_id"));



CREATE POLICY "Users can view risks for their org" ON "hse"."risk_register" FOR SELECT USING (("org_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can view roles for their org" ON "hse"."role_definitions" FOR SELECT USING (("organization_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can view spill records for their org" ON "hse"."spill_records" FOR SELECT USING (("org_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can view spill response for their org" ON "hse"."spill_response" FOR SELECT USING (("org_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can view their org subscription" ON "hse"."subscriptions" FOR SELECT USING (("organization_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



ALTER TABLE "hse"."access_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "hse"."actions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "hse"."audit_findings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "hse"."audit_log" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "hse"."audit_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "hse"."audit_schedule" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "hse"."competency_assessments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "hse"."competency_framework" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "hse"."competency_records" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "hse"."compliance_checklists" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "hse"."contractor_alerts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "hse"."contractor_communications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "hse"."contractor_documents" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "hse"."contractor_incidents" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "hse"."contractor_medical_records" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "hse"."contractor_reviews" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "hse"."contractor_site_assignments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "hse"."contractors" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "hse"."environmental_records" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "hse"."exposure_log" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "hse"."external_reports" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "hse"."fire_drills" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "hse"."fire_equipment" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "hse"."fire_safety_records" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "hse"."health_records" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "hse"."internal_audits" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "hse"."project_members" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "hse"."report_attachments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "hse"."reports" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "hse"."risk_register" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "hse"."role_definitions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "hse"."roles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "hse"."safety_inductions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "hse"."security_incidents" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "hse"."spill_records" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "hse"."spill_response" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "hse"."subscriptions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "hse"."team_communications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "hse"."team_members" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "hse"."team_performance" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "hse"."team_projects" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "hse"."team_resources" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "hse"."team_tasks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "hse"."teams" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "hse"."training_attendance" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "hse"."training_feedback" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "hse"."training_programs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "hse"."training_records" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "hse"."training_schedule" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "hse"."waste_management" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "Add activity" ON "public"."bf_activity_log" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Add comments" ON "public"."bf_comments" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Admins can manage channels" ON "public"."petrophysics_channels" USING ((EXISTS ( SELECT 1
   FROM "public"."petrophysics_team_members"
  WHERE (("petrophysics_team_members"."project_id" = "petrophysics_channels"."project_id") AND ("petrophysics_team_members"."user_id" = "auth"."uid"()) AND ("petrophysics_team_members"."role" = ANY (ARRAY['owner'::"text", 'admin'::"text"]))))));



CREATE POLICY "Admins can manage team members" ON "public"."petrophysics_team_members" USING (((EXISTS ( SELECT 1
   FROM "public"."petrophysics_projects"
  WHERE (("petrophysics_projects"."id" = "petrophysics_team_members"."project_id") AND ("petrophysics_projects"."user_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."petrophysics_team_members" "petrophysics_team_members_1"
  WHERE (("petrophysics_team_members_1"."project_id" = "petrophysics_team_members_1"."project_id") AND ("petrophysics_team_members_1"."user_id" = "auth"."uid"()) AND ("petrophysics_team_members_1"."role" = 'admin'::"text"))))));



CREATE POLICY "Admins manage discounts" ON "public"."discount_codes" USING ((EXISTS ( SELECT 1
   FROM "public"."organization_users"
  WHERE (("organization_users"."user_id" = "auth"."uid"()) AND ("organization_users"."role" = ANY (ARRAY['owner'::"text", 'admin'::"text", 'super_admin'::"text"]))))));



CREATE POLICY "Admins manage pricing" ON "public"."pricing_tiers" USING ((EXISTS ( SELECT 1
   FROM "public"."organization_users"
  WHERE (("organization_users"."user_id" = "auth"."uid"()) AND ("organization_users"."role" = ANY (ARRAY['owner'::"text", 'admin'::"text", 'super_admin'::"text"]))))));



CREATE POLICY "Admins view reports" ON "public"."billing_reports" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."organization_users"
  WHERE (("organization_users"."user_id" = "auth"."uid"()) AND ("organization_users"."role" = ANY (ARRAY['owner'::"text", 'admin'::"text", 'super_admin'::"text"]))))));



CREATE POLICY "Admins/Security can update security incidents" ON "public"."security_incidents" FOR UPDATE USING (("organization_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE (("organization_users"."user_id" = "auth"."uid"()) AND ("organization_users"."role" = ANY (ARRAY['owner'::"text", 'admin'::"text", 'security_manager'::"text"]))))));



CREATE POLICY "Allow admin full access" ON "public"."alerts" USING (("public"."get_my_claim"('user_role'::"text") = 'admin'::"text")) WITH CHECK (("public"."get_my_claim"('user_role'::"text") = 'admin'::"text"));



CREATE POLICY "Allow admin full access" ON "public"."anticollision_checks" USING (("public"."get_my_claim"('user_role'::"text") = 'admin'::"text")) WITH CHECK (("public"."get_my_claim"('user_role'::"text") = 'admin'::"text"));



CREATE POLICY "Allow admin full access" ON "public"."bhas" USING (("public"."get_my_claim"('user_role'::"text") = 'admin'::"text")) WITH CHECK (("public"."get_my_claim"('user_role'::"text") = 'admin'::"text"));



CREATE POLICY "Allow admin full access" ON "public"."casing_schemes" USING (("public"."get_my_claim"('user_role'::"text") = 'admin'::"text")) WITH CHECK (("public"."get_my_claim"('user_role'::"text") = 'admin'::"text"));



CREATE POLICY "Allow admin full access" ON "public"."cement_jobs" USING (("public"."get_my_claim"('user_role'::"text") = 'admin'::"text")) WITH CHECK (("public"."get_my_claim"('user_role'::"text") = 'admin'::"text"));



CREATE POLICY "Allow admin full access" ON "public"."completion_plans" USING (("public"."get_my_claim"('user_role'::"text") = 'admin'::"text")) WITH CHECK (("public"."get_my_claim"('user_role'::"text") = 'admin'::"text"));



CREATE POLICY "Allow admin full access" ON "public"."contour_projects" USING (("public"."get_my_claim"('user_role'::"text") = 'admin'::"text"));



CREATE POLICY "Allow admin full access" ON "public"."events" USING (("public"."get_my_claim"('user_role'::"text") = 'admin'::"text")) WITH CHECK (("public"."get_my_claim"('user_role'::"text") = 'admin'::"text"));



CREATE POLICY "Allow admin full access" ON "public"."facility_layouts" USING (("public"."get_my_claim"('user_role'::"text") = 'admin'::"text"));



CREATE POLICY "Allow admin full access" ON "public"."fdp_facilities" USING (("public"."get_my_claim"('user_role'::"text") = 'admin'::"text")) WITH CHECK (("public"."get_my_claim"('user_role'::"text") = 'admin'::"text"));



CREATE POLICY "Allow admin full access" ON "public"."fdp_price_decks" USING (("public"."get_my_claim"('user_role'::"text") = 'admin'::"text")) WITH CHECK (("public"."get_my_claim"('user_role'::"text") = 'admin'::"text"));



CREATE POLICY "Allow admin full access" ON "public"."fdp_projects" USING (("public"."get_my_claim"('user_role'::"text") = 'admin'::"text")) WITH CHECK (("public"."get_my_claim"('user_role'::"text") = 'admin'::"text"));



CREATE POLICY "Allow admin full access" ON "public"."fdp_wells" USING (("public"."get_my_claim"('user_role'::"text") = 'admin'::"text")) WITH CHECK (("public"."get_my_claim"('user_role'::"text") = 'admin'::"text"));



CREATE POLICY "Allow admin full access" ON "public"."frac_vault" USING (("public"."get_my_claim"('user_role'::"text") = 'admin'::"text")) WITH CHECK (("public"."get_my_claim"('user_role'::"text") = 'admin'::"text"));



CREATE POLICY "Allow admin full access" ON "public"."geomech_measurements" USING (("public"."get_my_claim"('user_role'::"text") = 'admin'::"text")) WITH CHECK (("public"."get_my_claim"('user_role'::"text") = 'admin'::"text"));



CREATE POLICY "Allow admin full access" ON "public"."geomech_params" USING (("public"."get_my_claim"('user_role'::"text") = 'admin'::"text")) WITH CHECK (("public"."get_my_claim"('user_role'::"text") = 'admin'::"text"));



CREATE POLICY "Allow admin full access" ON "public"."geomech_velocity" USING (("public"."get_my_claim"('user_role'::"text") = 'admin'::"text")) WITH CHECK (("public"."get_my_claim"('user_role'::"text") = 'admin'::"text"));



CREATE POLICY "Allow admin full access" ON "public"."hydraulics_runs" USING (("public"."get_my_claim"('user_role'::"text") = 'admin'::"text")) WITH CHECK (("public"."get_my_claim"('user_role'::"text") = 'admin'::"text"));



CREATE POLICY "Allow admin full access" ON "public"."log_facies_projects" USING (("public"."get_my_claim"('user_role'::"text") = 'admin'::"text"));



CREATE POLICY "Allow admin full access" ON "public"."mud_programs" USING (("public"."get_my_claim"('user_role'::"text") = 'admin'::"text")) WITH CHECK (("public"."get_my_claim"('user_role'::"text") = 'admin'::"text"));



CREATE POLICY "Allow admin full access" ON "public"."nextgen_registrations" USING ("public"."is_super_admin"()) WITH CHECK ("public"."is_super_admin"());



CREATE POLICY "Allow admin full access" ON "public"."offset_surveys" USING (("public"."get_my_claim"('user_role'::"text") = 'admin'::"text")) WITH CHECK (("public"."get_my_claim"('user_role'::"text") = 'admin'::"text"));



CREATE POLICY "Allow admin full access" ON "public"."offset_wells" USING (("public"."get_my_claim"('user_role'::"text") = 'admin'::"text")) WITH CHECK (("public"."get_my_claim"('user_role'::"text") = 'admin'::"text"));



CREATE POLICY "Allow admin full access" ON "public"."pressure_gradients" USING (("public"."get_my_claim"('user_role'::"text") = 'admin'::"text")) WITH CHECK (("public"."get_my_claim"('user_role'::"text") = 'admin'::"text"));



CREATE POLICY "Allow admin full access" ON "public"."projects" USING (("public"."get_my_claim"('user_role'::"text") = 'admin'::"text")) WITH CHECK (("public"."get_my_claim"('user_role'::"text") = 'admin'::"text"));



CREATE POLICY "Allow admin full access" ON "public"."pvt_results" USING (("public"."get_my_claim"('user_role'::"text") = 'admin'::"text")) WITH CHECK (("public"."get_my_claim"('user_role'::"text") = 'admin'::"text"));



CREATE POLICY "Allow admin full access" ON "public"."resources" USING (("public"."get_my_claim"('user_role'::"text") = 'admin'::"text")) WITH CHECK (("public"."get_my_claim"('user_role'::"text") = 'admin'::"text"));



CREATE POLICY "Allow admin full access" ON "public"."risks" USING (("public"."get_my_claim"('user_role'::"text") = 'admin'::"text")) WITH CHECK (("public"."get_my_claim"('user_role'::"text") = 'admin'::"text"));



CREATE POLICY "Allow admin full access" ON "public"."rto_connections" USING (("public"."get_my_claim"('user_role'::"text") = 'admin'::"text")) WITH CHECK (("public"."get_my_claim"('user_role'::"text") = 'admin'::"text"));



CREATE POLICY "Allow admin full access" ON "public"."rto_settings" USING (("public"."get_my_claim"('user_role'::"text") = 'admin'::"text")) WITH CHECK (("public"."get_my_claim"('user_role'::"text") = 'admin'::"text"));



CREATE POLICY "Allow admin full access" ON "public"."saved_casing_design_projects" USING (("public"."get_my_claim"('user_role'::"text") = 'admin'::"text")) WITH CHECK (("public"."get_my_claim"('user_role'::"text") = 'admin'::"text"));



CREATE POLICY "Allow admin full access" ON "public"."saved_compressor_pump_projects" USING (("public"."get_my_claim"('user_role'::"text") = 'admin'::"text"));



CREATE POLICY "Allow admin full access" ON "public"."saved_dca_projects" USING (("public"."get_my_claim"('user_role'::"text") = 'admin'::"text")) WITH CHECK (("public"."get_my_claim"('user_role'::"text") = 'admin'::"text"));



CREATE POLICY "Allow admin full access" ON "public"."saved_drilling_fluids_projects" USING (("public"."get_my_claim"('user_role'::"text") = 'admin'::"text")) WITH CHECK (("public"."get_my_claim"('user_role'::"text") = 'admin'::"text"));



CREATE POLICY "Allow admin full access" ON "public"."saved_heat_exchanger_projects" USING (("public"."get_my_claim"('user_role'::"text") = 'admin'::"text"));



CREATE POLICY "Allow admin full access" ON "public"."saved_mbal_projects" USING (("public"."get_my_claim"('user_role'::"text") = 'admin'::"text")) WITH CHECK (("public"."get_my_claim"('user_role'::"text") = 'admin'::"text"));



CREATE POLICY "Allow admin full access" ON "public"."saved_nodal_analysis_projects" USING (("public"."get_my_claim"('user_role'::"text") = 'admin'::"text"));



CREATE POLICY "Allow admin full access" ON "public"."saved_petrophysics_projects" USING (("public"."get_my_claim"('user_role'::"text") = 'admin'::"text")) WITH CHECK (("public"."get_my_claim"('user_role'::"text") = 'admin'::"text"));



CREATE POLICY "Allow admin full access" ON "public"."saved_pipeline_sizer_projects" USING (("public"."get_my_claim"('user_role'::"text") = 'admin'::"text"));



CREATE POLICY "Allow admin full access" ON "public"."saved_pvt_projects" USING (("public"."get_my_claim"('user_role'::"text") = 'admin'::"text")) WITH CHECK (("public"."get_my_claim"('user_role'::"text") = 'admin'::"text"));



CREATE POLICY "Allow admin full access" ON "public"."saved_quickvol_projects" USING (("public"."get_my_claim"('user_role'::"text") = 'admin'::"text")) WITH CHECK (("public"."get_my_claim"('user_role'::"text") = 'admin'::"text"));



CREATE POLICY "Allow admin full access" ON "public"."saved_relief_projects" USING (("public"."get_my_claim"('user_role'::"text") = 'admin'::"text"));



CREATE POLICY "Allow admin full access" ON "public"."saved_report_autopilot_projects" USING (("public"."get_my_claim"('user_role'::"text") = 'admin'::"text")) WITH CHECK (("public"."get_my_claim"('user_role'::"text") = 'admin'::"text"));



CREATE POLICY "Allow admin full access" ON "public"."saved_well_cost_iq_projects" USING (("public"."get_my_claim"('user_role'::"text") = 'admin'::"text"));



CREATE POLICY "Allow admin full access" ON "public"."saved_well_cost_projects" USING (("public"."get_my_claim"('user_role'::"text") = 'admin'::"text")) WITH CHECK (("public"."get_my_claim"('user_role'::"text") = 'admin'::"text"));



CREATE POLICY "Allow admin full access" ON "public"."surveys" USING (("public"."get_my_claim"('user_role'::"text") = 'admin'::"text")) WITH CHECK (("public"."get_my_claim"('user_role'::"text") = 'admin'::"text"));



CREATE POLICY "Allow admin full access" ON "public"."tasks" USING (("public"."get_my_claim"('user_role'::"text") = 'admin'::"text")) WITH CHECK (("public"."get_my_claim"('user_role'::"text") = 'admin'::"text"));



CREATE POLICY "Allow admin full access" ON "public"."torque_drag_runs" USING (("public"."get_my_claim"('user_role'::"text") = 'admin'::"text")) WITH CHECK (("public"."get_my_claim"('user_role'::"text") = 'admin'::"text"));



CREATE POLICY "Allow admin full access" ON "public"."trajectory_plans" USING (("public"."get_my_claim"('user_role'::"text") = 'admin'::"text")) WITH CHECK (("public"."get_my_claim"('user_role'::"text") = 'admin'::"text"));



CREATE POLICY "Allow admin full access" ON "public"."well_targets" USING (("public"."get_my_claim"('user_role'::"text") = 'admin'::"text")) WITH CHECK (("public"."get_my_claim"('user_role'::"text") = 'admin'::"text"));



CREATE POLICY "Allow admin full access" ON "public"."wells" FOR SELECT USING ("public"."is_super_admin"());



CREATE POLICY "Allow admin write access" ON "public"."tubular_grades" USING ("public"."is_super_admin"());



CREATE POLICY "Allow authenticated users to insert apps" ON "public"."master_apps" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Allow authenticated users to insert notifications" ON "public"."user_notifications" FOR INSERT WITH CHECK (("auth"."role"() = 'authenticated'::"text"));



CREATE POLICY "Allow engineers/admins to manage" ON "public"."gm_curves" USING ((("org_id" = "public"."get_my_organization_id"()) AND ("public"."get_my_organization_role"() = ANY (ARRAY['admin'::"text", 'engineer'::"text"]))));



CREATE POLICY "Allow engineers/admins to manage" ON "public"."gm_datasets" USING ((("org_id" = "public"."get_my_organization_id"()) AND ("public"."get_my_organization_role"() = ANY (ARRAY['admin'::"text", 'engineer'::"text"]))));



CREATE POLICY "Allow engineers/admins to manage" ON "public"."gm_events" USING ((("org_id" = "public"."get_my_organization_id"()) AND ("public"."get_my_organization_role"() = ANY (ARRAY['admin'::"text", 'engineer'::"text"]))));



CREATE POLICY "Allow engineers/admins to manage" ON "public"."gm_models" USING ((("org_id" = "public"."get_my_organization_id"()) AND ("public"."get_my_organization_role"() = ANY (ARRAY['admin'::"text", 'engineer'::"text"]))));



CREATE POLICY "Allow engineers/admins to manage" ON "public"."gm_run_points" USING ((("org_id" = "public"."get_my_organization_id"()) AND ("public"."get_my_organization_role"() = ANY (ARRAY['admin'::"text", 'engineer'::"text"]))));



CREATE POLICY "Allow engineers/admins to manage" ON "public"."gm_runs" USING ((("org_id" = "public"."get_my_organization_id"()) AND ("public"."get_my_organization_role"() = ANY (ARRAY['admin'::"text", 'engineer'::"text"]))));



CREATE POLICY "Allow engineers/admins to manage" ON "public"."gm_wells" USING ((("org_id" = "public"."get_my_organization_id"()) AND ("public"."get_my_organization_role"() = ANY (ARRAY['admin'::"text", 'engineer'::"text"]))));



CREATE POLICY "Allow org members access" ON "public"."annuli" USING (("well_id" IN ( SELECT "wells"."id"
   FROM "public"."wells"
  WHERE ("wells"."user_id" = "auth"."uid"())))) WITH CHECK (("well_id" IN ( SELECT "wells"."id"
   FROM "public"."wells"
  WHERE ("wells"."user_id" = "auth"."uid"()))));



CREATE POLICY "Allow org members access" ON "public"."calc_runs" USING (("well_id" IN ( SELECT "wells"."id"
   FROM "public"."wells"
  WHERE ("wells"."user_id" = "auth"."uid"())))) WITH CHECK (("well_id" IN ( SELECT "wells"."id"
   FROM "public"."wells"
  WHERE ("wells"."user_id" = "auth"."uid"()))));



CREATE POLICY "Allow org members to select" ON "public"."gm_curves" FOR SELECT USING (("org_id" = "public"."get_my_organization_id"()));



CREATE POLICY "Allow org members to select" ON "public"."gm_datasets" FOR SELECT USING (("org_id" = "public"."get_my_organization_id"()));



CREATE POLICY "Allow org members to select" ON "public"."gm_events" FOR SELECT USING (("org_id" = "public"."get_my_organization_id"()));



CREATE POLICY "Allow org members to select" ON "public"."gm_models" FOR SELECT USING (("org_id" = "public"."get_my_organization_id"()));



CREATE POLICY "Allow org members to select" ON "public"."gm_run_points" FOR SELECT USING (("org_id" = "public"."get_my_organization_id"()));



CREATE POLICY "Allow org members to select" ON "public"."gm_runs" FOR SELECT USING (("org_id" = "public"."get_my_organization_id"()));



CREATE POLICY "Allow org members to select" ON "public"."gm_wells" FOR SELECT USING (("org_id" = "public"."get_my_organization_id"()));



CREATE POLICY "Allow public form submissions" ON "public"."nextgen_registrations" FOR INSERT WITH CHECK (true);



CREATE POLICY "Allow public insert" ON "public"."demo_requests" FOR INSERT WITH CHECK (true);



CREATE POLICY "Allow public read access" ON "public"."drilling_incidents" FOR SELECT USING (true);



CREATE POLICY "Allow public read access" ON "public"."tubular_grades" FOR SELECT USING (true);



CREATE POLICY "Allow read access for authenticated users" ON "public"."master_apps" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Allow service role full access" ON "public"."demo_requests" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Allow super admin write access" ON "public"."master_apps" TO "authenticated" USING ("public"."is_super_admin"());



CREATE POLICY "Allow users to read own notifications" ON "public"."user_notifications" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow users to update own notifications" ON "public"."user_notifications" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Allow users to view own requests" ON "public"."demo_requests" FOR SELECT USING ((("auth"."uid"() IS NOT NULL) AND ("email" = (( SELECT "users"."email"
   FROM "auth"."users"
  WHERE ("users"."id" = "auth"."uid"())))::"text")));



CREATE POLICY "Anyone can view available modules" ON "public"."available_modules" FOR SELECT USING (true);



CREATE POLICY "Editors can manage versions" ON "public"."petrophysics_project_versions" FOR INSERT WITH CHECK (((EXISTS ( SELECT 1
   FROM "public"."petrophysics_projects"
  WHERE (("petrophysics_projects"."id" = "petrophysics_project_versions"."project_id") AND ("petrophysics_projects"."user_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."petrophysics_team_members"
  WHERE (("petrophysics_team_members"."project_id" = "petrophysics_project_versions"."project_id") AND ("petrophysics_team_members"."user_id" = "auth"."uid"()) AND ("petrophysics_team_members"."role" = ANY (ARRAY['admin'::"text", 'editor'::"text"])))))));



CREATE POLICY "Enable insert for everyone" ON "public"."demo_requests" FOR INSERT WITH CHECK (true);



CREATE POLICY "Enable read access for authenticated users" ON "public"."econ_fiscal_terms" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Enable read access for authenticated users" ON "public"."econ_metrics" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Enable read access for authenticated users" ON "public"."econ_results" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Enable read for service role only" ON "public"."demo_requests" FOR SELECT USING (("auth"."role"() = 'service_role'::"text"));



CREATE POLICY "Enable update access for authenticated users" ON "public"."econ_fiscal_terms" FOR UPDATE TO "authenticated" USING (true);



CREATE POLICY "Enable write access for authenticated users" ON "public"."econ_fiscal_terms" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable write access for authenticated users" ON "public"."econ_metrics" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable write access for authenticated users" ON "public"."econ_results" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Incidents Insert Policy" ON "public"."incidents" FOR INSERT WITH CHECK (("organization_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Incidents Update Policy" ON "public"."incidents" FOR UPDATE USING (("organization_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Incidents View Policy" ON "public"."incidents" FOR SELECT USING (("organization_id" IN ( SELECT "organization_members"."organization_id"
   FROM "public"."organization_members"
  WHERE ("organization_members"."user_id" = "auth"."uid"()))));



CREATE POLICY "Insert attachments" ON "public"."incident_attachments" FOR INSERT WITH CHECK (true);



CREATE POLICY "Insert comments" ON "public"."incident_comments" FOR INSERT WITH CHECK (true);



CREATE POLICY "Insert media" ON "public"."quick_report_media" FOR INSERT WITH CHECK (true);



CREATE POLICY "Insert notifications" ON "public"."quick_report_notifications" FOR INSERT WITH CHECK (true);



CREATE POLICY "Insert reports" ON "public"."quick_reports" FOR INSERT WITH CHECK (true);



CREATE POLICY "Manage team members" ON "public"."bf_team_members" USING (("auth"."uid"() IN ( SELECT "bf_team_members_1"."user_id"
   FROM "public"."bf_team_members" "bf_team_members_1"
  WHERE (("bf_team_members_1"."project_id" = "bf_team_members_1"."project_id") AND ("bf_team_members_1"."role" = ANY (ARRAY['owner'::"text", 'admin'::"text"]))))));



CREATE POLICY "Members can insert their own requests" ON "public"."access_requests" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."organization_members"
  WHERE (("organization_members"."id" = "access_requests"."member_id") AND ("organization_members"."user_id" = "auth"."uid"())))));



CREATE POLICY "Members can view other members" ON "public"."quickvol_workspace_members" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."quickvol_workspace_members" "m"
  WHERE (("m"."workspace_id" = "m"."workspace_id") AND ("m"."user_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."quickvol_workspaces" "w"
  WHERE (("w"."id" = "quickvol_workspace_members"."workspace_id") AND ("w"."owner_id" = "auth"."uid"()))))));



CREATE POLICY "Members can view their own access" ON "public"."employee_app_access" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."organization_members"
  WHERE (("organization_members"."id" = "employee_app_access"."member_id") AND ("organization_members"."user_id" = "auth"."uid"())))));



CREATE POLICY "Members can view their own requests" ON "public"."access_requests" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."organization_members"
  WHERE (("organization_members"."id" = "access_requests"."member_id") AND ("organization_members"."user_id" = "auth"."uid"())))));



CREATE POLICY "Members can view their own storage" ON "public"."employee_storage" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."organization_members"
  WHERE (("organization_members"."id" = "employee_storage"."member_id") AND ("organization_members"."user_id" = "auth"."uid"())))));



CREATE POLICY "Mental Health is confidential" ON "public"."mental_health_assessments" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Org Access Authorities" ON "public"."regulatory_authorities" USING (("org_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Org Access Compliance" ON "public"."fire_safety_compliance" USING (("org_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Org Access Drills" ON "public"."fire_drills" USING (("org_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Org Access EMP" ON "public"."environment_emp_actions" USING (("org_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Org Access ERP" ON "public"."fire_emergency_response_plans" USING (("org_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Org Access Equipment" ON "public"."fire_equipment_inventory" USING (("org_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Org Access Facilities" ON "public"."environment_facilities" USING (("org_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Org Access Flaring" ON "public"."environment_flaring_logs" USING (("org_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Org Access Incidents" ON "public"."fire_incidents" USING (("org_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Org Access Investigation" ON "public"."fire_incident_investigation" USING (("org_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Org Access KRIs" ON "public"."risk_kris" USING (("risk_id" IN ( SELECT "risk_register"."id"
   FROM "public"."risk_register"
  WHERE ("risk_register"."org_id" IN ( SELECT "organization_users"."organization_id"
           FROM "public"."organization_users"
          WHERE ("organization_users"."user_id" = "auth"."uid"()))))));



CREATE POLICY "Org Access Maintenance" ON "public"."fire_equipment_maintenance" USING (("org_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Org Access Mitigation" ON "public"."risk_mitigation_actions" USING (("risk_id" IN ( SELECT "risk_register"."id"
   FROM "public"."risk_register"
  WHERE ("risk_register"."org_id" IN ( SELECT "organization_users"."organization_id"
           FROM "public"."organization_users"
          WHERE ("organization_users"."user_id" = "auth"."uid"()))))));



CREATE POLICY "Org Access Monitoring" ON "public"."environment_monitoring_results" USING (("org_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Org Access Obligations" ON "public"."environment_obligations" USING (("org_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Org Access Obligations" ON "public"."regulatory_obligations" USING (("org_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Org Access Permits" ON "public"."environment_permits" USING (("org_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Org Access Risks" ON "public"."fire_safety_risks" USING (("org_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Org Access Risks" ON "public"."risk_register" USING (("org_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Org Access Scenarios" ON "public"."risk_scenarios" USING (("org_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Org Access Spills" ON "public"."environment_spill_reports" USING (("org_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Org Access Studies" ON "public"."environment_studies" USING (("org_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Org Access Waste" ON "public"."environment_waste_manifests" USING (("org_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Org Admins and Super Admins can insert settings" ON "public"."org_settings" FOR INSERT WITH CHECK (("public"."is_org_admin_of"("org_id") OR "public"."is_super_admin"()));



CREATE POLICY "Org Admins and Super Admins can update settings" ON "public"."org_settings" FOR UPDATE USING (("public"."is_org_admin_of"("org_id") OR "public"."is_super_admin"()));



CREATE POLICY "Org Admins can manage all requests" ON "public"."access_requests" USING ((EXISTS ( SELECT 1
   FROM "public"."organization_users"
  WHERE (("organization_users"."user_id" = "auth"."uid"()) AND ("organization_users"."organization_id" = "access_requests"."organization_id") AND ("organization_users"."role" = ANY (ARRAY['owner'::"text", 'admin'::"text", 'org_admin'::"text", 'super_admin'::"text"]))))));



CREATE POLICY "Org Admins can manage app access" ON "public"."employee_app_access" USING ((EXISTS ( SELECT 1
   FROM "public"."organization_users"
  WHERE (("organization_users"."user_id" = "auth"."uid"()) AND ("organization_users"."organization_id" = "employee_app_access"."organization_id") AND ("organization_users"."role" = ANY (ARRAY['owner'::"text", 'admin'::"text", 'org_admin'::"text", 'super_admin'::"text"]))))));



CREATE POLICY "Org Admins can manage storage" ON "public"."employee_storage" USING ((EXISTS ( SELECT 1
   FROM "public"."organization_users"
  WHERE (("organization_users"."user_id" = "auth"."uid"()) AND ("organization_users"."organization_id" = "employee_storage"."organization_id") AND ("organization_users"."role" = ANY (ARRAY['owner'::"text", 'admin'::"text", 'org_admin'::"text", 'super_admin'::"text"]))))));



CREATE POLICY "Org admins can insert audit log" ON "public"."branding_audit_log" FOR INSERT WITH CHECK (("organization_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE (("organization_users"."user_id" = "auth"."uid"()) AND ("organization_users"."user_role" = ANY (ARRAY['super_admin'::"text", 'org_admin'::"text"]))))));



CREATE POLICY "Org admins can manage assignments" ON "public"."app_seat_assignments" USING ((EXISTS ( SELECT 1
   FROM "public"."organization_users"
  WHERE (("organization_users"."user_id" = "auth"."uid"()) AND ("organization_users"."organization_id" = "app_seat_assignments"."organization_id") AND ("organization_users"."role" = ANY (ARRAY['owner'::"text", 'admin'::"text", 'org_admin'::"text"]))))));



CREATE POLICY "Org admins can manage payment methods" ON "public"."payment_methods" USING (("organization_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE (("organization_users"."user_id" = "auth"."uid"()) AND ("organization_users"."role" = ANY (ARRAY['owner'::"text", 'admin'::"text", 'org_admin'::"text"]))))));



CREATE POLICY "Org admins can manage presets" ON "public"."branding_presets" USING (("organization_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE (("organization_users"."user_id" = "auth"."uid"()) AND ("organization_users"."user_role" = ANY (ARRAY['super_admin'::"text", 'org_admin'::"text"]))))));



CREATE POLICY "Org admins can manage sites" ON "public"."sites" USING (("org_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE (("organization_users"."user_id" = "auth"."uid"()) AND ("organization_users"."user_role" = ANY (ARRAY['org_admin'::"text", 'super_admin'::"text"]))))));



CREATE POLICY "Org admins can read audit log" ON "public"."branding_audit_log" FOR SELECT USING (("organization_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE (("organization_users"."user_id" = "auth"."uid"()) AND ("organization_users"."user_role" = ANY (ARRAY['super_admin'::"text", 'org_admin'::"text"]))))));



CREATE POLICY "Org admins can update users" ON "public"."organization_users" FOR UPDATE USING ("public"."is_org_admin_of"("organization_id"));



CREATE POLICY "Org admins can view renewal audit logs" ON "public"."renewal_audit_log" FOR SELECT USING (("organization_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE (("organization_users"."user_id" = "auth"."uid"()) AND ("organization_users"."role" = ANY (ARRAY['owner'::"text", 'admin'::"text", 'org_admin'::"text"]))))));



CREATE POLICY "Org admins can view renewal notifications" ON "public"."renewal_notifications" FOR SELECT USING (("organization_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE (("organization_users"."user_id" = "auth"."uid"()) AND ("organization_users"."role" = ANY (ARRAY['owner'::"text", 'admin'::"text", 'org_admin'::"text"]))))));



CREATE POLICY "Org admins create invitations" ON "public"."invitations" FOR INSERT WITH CHECK (("org_id" IN ( SELECT "organization_members"."organization_id"
   FROM "public"."organization_members"
  WHERE (("organization_members"."user_id" = "auth"."uid"()) AND ("organization_members"."role" = ANY (ARRAY['owner'::"text", 'admin'::"text", 'org_admin'::"text", 'super_admin'::"text"]))))));



CREATE POLICY "Org admins delete invitations" ON "public"."invitations" FOR DELETE USING (("org_id" IN ( SELECT "organization_members"."organization_id"
   FROM "public"."organization_members"
  WHERE (("organization_members"."user_id" = "auth"."uid"()) AND ("organization_members"."role" = ANY (ARRAY['owner'::"text", 'admin'::"text", 'org_admin'::"text", 'super_admin'::"text"]))))));



CREATE POLICY "Org admins delete sites" ON "public"."organization_sites" FOR DELETE USING (("organization_id" IN ( SELECT "organization_members"."organization_id"
   FROM "public"."organization_members"
  WHERE (("organization_members"."user_id" = "auth"."uid"()) AND ("organization_members"."role" = ANY (ARRAY['owner'::"text", 'admin'::"text", 'org_admin'::"text", 'super_admin'::"text"]))))));



CREATE POLICY "Org admins insert sites" ON "public"."organization_sites" FOR INSERT WITH CHECK (("organization_id" IN ( SELECT "organization_members"."organization_id"
   FROM "public"."organization_members"
  WHERE (("organization_members"."user_id" = "auth"."uid"()) AND ("organization_members"."role" = ANY (ARRAY['owner'::"text", 'admin'::"text", 'org_admin'::"text", 'super_admin'::"text"]))))));



CREATE POLICY "Org admins manage bulk imports" ON "public"."bulk_import_jobs" USING (("organization_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE (("organization_users"."user_id" = "auth"."uid"()) AND ("organization_users"."role" = ANY (ARRAY['owner'::"text", 'admin'::"text", 'org_admin'::"text", 'super_admin'::"text"]))))));



CREATE POLICY "Org admins manage custom fields" ON "public"."custom_fields" USING (true);



CREATE POLICY "Org admins manage departments" ON "public"."departments" USING (("organization_id" IN ( SELECT "organization_members"."organization_id"
   FROM "public"."organization_members"
  WHERE (("organization_members"."user_id" = "auth"."uid"()) AND ("organization_members"."role" = ANY (ARRAY['owner'::"text", 'admin'::"text", 'org_admin'::"text", 'super_admin'::"text"])))))) WITH CHECK (("organization_id" IN ( SELECT "organization_members"."organization_id"
   FROM "public"."organization_members"
  WHERE (("organization_members"."user_id" = "auth"."uid"()) AND ("organization_members"."role" = ANY (ARRAY['owner'::"text", 'admin'::"text", 'org_admin'::"text", 'super_admin'::"text"]))))));



CREATE POLICY "Org admins manage rules" ON "public"."compliance_rules" USING (("org_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE (("organization_users"."user_id" = "auth"."uid"()) AND ("organization_users"."user_role" = ANY (ARRAY['org_admin'::"text", 'super_admin'::"text"]))))));



CREATE POLICY "Org admins manage team members" ON "public"."team_members" USING (("team_id" IN ( SELECT "t"."id"
   FROM "public"."teams" "t"
  WHERE ("t"."organization_id" IN ( SELECT "organization_members"."organization_id"
           FROM "public"."organization_members"
          WHERE (("organization_members"."user_id" = "auth"."uid"()) AND ("organization_members"."role" = ANY (ARRAY['owner'::"text", 'admin'::"text", 'org_admin'::"text", 'super_admin'::"text"])))))))) WITH CHECK (("team_id" IN ( SELECT "t"."id"
   FROM "public"."teams" "t"
  WHERE ("t"."organization_id" IN ( SELECT "organization_members"."organization_id"
           FROM "public"."organization_members"
          WHERE (("organization_members"."user_id" = "auth"."uid"()) AND ("organization_members"."role" = ANY (ARRAY['owner'::"text", 'admin'::"text", 'org_admin'::"text", 'super_admin'::"text"]))))))));



CREATE POLICY "Org admins manage teams" ON "public"."teams" USING (("organization_id" IN ( SELECT "organization_members"."organization_id"
   FROM "public"."organization_members"
  WHERE (("organization_members"."user_id" = "auth"."uid"()) AND ("organization_members"."role" = ANY (ARRAY['owner'::"text", 'admin'::"text", 'org_admin'::"text", 'super_admin'::"text"])))))) WITH CHECK (("organization_id" IN ( SELECT "organization_members"."organization_id"
   FROM "public"."organization_members"
  WHERE (("organization_members"."user_id" = "auth"."uid"()) AND ("organization_members"."role" = ANY (ARRAY['owner'::"text", 'admin'::"text", 'org_admin'::"text", 'super_admin'::"text"]))))));



CREATE POLICY "Org admins manage workflows" ON "public"."custom_workflows" USING (true);



CREATE POLICY "Org admins update sites" ON "public"."organization_sites" FOR UPDATE USING (("organization_id" IN ( SELECT "organization_members"."organization_id"
   FROM "public"."organization_members"
  WHERE (("organization_members"."user_id" = "auth"."uid"()) AND ("organization_members"."role" = ANY (ARRAY['owner'::"text", 'admin'::"text", 'org_admin'::"text", 'super_admin'::"text"]))))));



CREATE POLICY "Org admins view access logs" ON "public"."access_audit_log" FOR SELECT USING (("organization_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE (("organization_users"."user_id" = "auth"."uid"()) AND ("organization_users"."role" = ANY (ARRAY['owner'::"text", 'admin'::"text", 'org_admin'::"text"]))))));



CREATE POLICY "Org admins view analytics" ON "public"."app_analytics_daily" FOR SELECT USING (("organization_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE (("organization_users"."user_id" = "auth"."uid"()) AND ("organization_users"."role" = ANY (ARRAY['owner'::"text", 'admin'::"text", 'org_admin'::"text"]))))));



CREATE POLICY "Org admins view audit logs" ON "public"."organization_audit_logs" FOR SELECT USING (("organization_id" IN ( SELECT "organization_members"."organization_id"
   FROM "public"."organization_members"
  WHERE (("organization_members"."user_id" = "auth"."uid"()) AND ("organization_members"."role" = ANY (ARRAY['owner'::"text", 'admin'::"text", 'org_admin'::"text", 'super_admin'::"text"]))))));



CREATE POLICY "Org admins view invitations" ON "public"."invitations" FOR SELECT USING (("org_id" IN ( SELECT "organization_members"."organization_id"
   FROM "public"."organization_members"
  WHERE (("organization_members"."user_id" = "auth"."uid"()) AND ("organization_members"."role" = ANY (ARRAY['owner'::"text", 'admin'::"text", 'org_admin'::"text", 'super_admin'::"text"]))))));



CREATE POLICY "Org admins view org tickets" ON "public"."support_tickets" FOR SELECT USING (("organization_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE (("organization_users"."user_id" = "auth"."uid"()) AND ("organization_users"."role" = ANY (ARRAY['owner'::"text", 'admin'::"text", 'super_admin'::"text"]))))));



CREATE POLICY "Org admins view reminders" ON "public"."renewal_reminders" FOR SELECT USING (("organization_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE (("organization_users"."user_id" = "auth"."uid"()) AND ("organization_users"."role" = ANY (ARRAY['owner'::"text", 'admin'::"text", 'org_admin'::"text", 'super_admin'::"text"]))))));



CREATE POLICY "Org admins/auditors can manage audits" ON "public"."safety_audits" USING (("organization_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE (("organization_users"."user_id" = "auth"."uid"()) AND ("organization_users"."role" = ANY (ARRAY['owner'::"text", 'admin'::"text", 'auditor'::"text"]))))));



CREATE POLICY "Org members can insert alerts" ON "public"."alerts" FOR INSERT WITH CHECK (("organization_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Org members can insert env data" ON "public"."environmental_monitoring" FOR INSERT WITH CHECK (("organization_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Org members can insert recommendations" ON "public"."recommendations" FOR INSERT WITH CHECK (("organization_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Org members can manage MOCs" ON "public"."moc_records" USING (("org_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Org members can manage hazards" ON "public"."hazard_assessments" USING (("organization_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Org members can manage peer review comments" ON "public"."peer_review_comments" USING (("review_id" IN ( SELECT "peer_reviews"."id"
   FROM "public"."peer_reviews"
  WHERE ("peer_reviews"."org_id" IN ( SELECT "organization_users"."organization_id"
           FROM "public"."organization_users"
          WHERE ("organization_users"."user_id" = "auth"."uid"()))))));



CREATE POLICY "Org members can manage peer reviews" ON "public"."peer_reviews" USING (("org_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Org members can read presets" ON "public"."branding_presets" FOR SELECT USING (("organization_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Org members can update alerts" ON "public"."alerts" FOR UPDATE USING (("organization_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Org members can update recommendations" ON "public"."recommendations" FOR UPDATE USING (("organization_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Org members can view MOCs" ON "public"."moc_records" FOR SELECT USING (("org_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Org members can view assignments" ON "public"."app_seat_assignments" FOR SELECT USING (("organization_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Org members can view audits" ON "public"."safety_audits" FOR SELECT USING (("organization_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Org members can view env data" ON "public"."environmental_monitoring" FOR SELECT USING (("organization_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Org members can view hazards" ON "public"."hazard_assessments" FOR SELECT USING (("organization_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Org members can view own payments" ON "public"."payments" FOR SELECT USING (("organization_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Org members can view peer review audit" ON "public"."peer_review_audit" FOR SELECT USING (("review_id" IN ( SELECT "peer_reviews"."id"
   FROM "public"."peer_reviews"
  WHERE ("peer_reviews"."org_id" IN ( SELECT "organization_users"."organization_id"
           FROM "public"."organization_users"
          WHERE ("organization_users"."user_id" = "auth"."uid"()))))));



CREATE POLICY "Org members can view peer review comments" ON "public"."peer_review_comments" FOR SELECT USING (("review_id" IN ( SELECT "peer_reviews"."id"
   FROM "public"."peer_reviews"
  WHERE ("peer_reviews"."org_id" IN ( SELECT "organization_users"."organization_id"
           FROM "public"."organization_users"
          WHERE ("organization_users"."user_id" = "auth"."uid"()))))));



CREATE POLICY "Org members can view peer reviews" ON "public"."peer_reviews" FOR SELECT USING (("org_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Org members can view sites" ON "public"."sites" FOR SELECT USING (("org_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Org members view access" ON "public"."module_access" FOR SELECT USING (("organization_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Org members view custom fields" ON "public"."custom_fields" FOR SELECT USING (true);



CREATE POLICY "Org members view departments" ON "public"."departments" FOR SELECT USING (("organization_id" IN ( SELECT "organization_members"."organization_id"
   FROM "public"."organization_members"
  WHERE ("organization_members"."user_id" = "auth"."uid"()))));



CREATE POLICY "Org members view events" ON "public"."subscription_events" FOR SELECT USING (("organization_id" IN ( SELECT "organization_members"."organization_id"
   FROM "public"."organization_members"
  WHERE ("organization_members"."user_id" = "auth"."uid"()))));



CREATE POLICY "Org members view own logs" ON "public"."organization_audit_logs" FOR SELECT USING (("actor_id" = "auth"."uid"()));



CREATE POLICY "Org members view profiles" ON "public"."user_profiles" FOR SELECT USING (("org_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Org members view purchased modules" ON "public"."purchased_modules" FOR SELECT USING (("organization_id" IN ( SELECT "organization_members"."organization_id"
   FROM "public"."organization_members"
  WHERE ("organization_members"."user_id" = "auth"."uid"()))));



CREATE POLICY "Org members view rules" ON "public"."compliance_rules" FOR SELECT USING (("org_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Org members view sites" ON "public"."organization_sites" FOR SELECT USING (("organization_id" IN ( SELECT "organization_members"."organization_id"
   FROM "public"."organization_members"
  WHERE ("organization_members"."user_id" = "auth"."uid"()))));



CREATE POLICY "Org members view team members" ON "public"."team_members" FOR SELECT USING (("team_id" IN ( SELECT "t"."id"
   FROM "public"."teams" "t"
  WHERE ("t"."organization_id" IN ( SELECT "organization_members"."organization_id"
           FROM "public"."organization_members"
          WHERE ("organization_members"."user_id" = "auth"."uid"()))))));



CREATE POLICY "Org members view teams" ON "public"."teams" FOR SELECT USING (("organization_id" IN ( SELECT "organization_members"."organization_id"
   FROM "public"."organization_members"
  WHERE ("organization_members"."user_id" = "auth"."uid"()))));



CREATE POLICY "Org members view usage" ON "public"."subscription_usage" FOR SELECT USING (("organization_id" IN ( SELECT "organization_members"."organization_id"
   FROM "public"."organization_members"
  WHERE ("organization_members"."user_id" = "auth"."uid"()))));



CREATE POLICY "Org members view workflows" ON "public"."custom_workflows" FOR SELECT USING (true);



CREATE POLICY "Owners and Admins can manage members" ON "public"."quickvol_workspace_members" USING (((EXISTS ( SELECT 1
   FROM "public"."quickvol_workspaces"
  WHERE (("quickvol_workspaces"."id" = "quickvol_workspace_members"."workspace_id") AND ("quickvol_workspaces"."owner_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."quickvol_workspace_members" "quickvol_workspace_members_1"
  WHERE (("quickvol_workspace_members_1"."workspace_id" = "quickvol_workspace_members_1"."workspace_id") AND ("quickvol_workspace_members_1"."user_id" = "auth"."uid"()) AND ("quickvol_workspace_members_1"."role" = 'admin'::"text"))))));



CREATE POLICY "Partners manage tenants" ON "public"."tenants" USING (("auth"."uid"() = "partner_id"));



CREATE POLICY "Public Read Branding" ON "public"."organization_branding" FOR SELECT USING (true);



CREATE POLICY "Public Read Templates" ON "public"."branding_templates" FOR SELECT USING (true);



CREATE POLICY "Public can update invitation by token" ON "public"."invitations" FOR UPDATE USING (true);



CREATE POLICY "Public can view invitations" ON "public"."invitations" FOR SELECT USING (true);



CREATE POLICY "Public read pricing" ON "public"."pricing_tiers" FOR SELECT USING (true);



CREATE POLICY "Read access for categories" ON "public"."safety_moment_categories" FOR SELECT USING (true);



CREATE POLICY "Read access for help articles" ON "public"."help_articles" FOR SELECT USING (("is_published" = true));



CREATE POLICY "Read access for help categories" ON "public"."help_categories" FOR SELECT USING (true);



CREATE POLICY "Read access for moments" ON "public"."safety_moments" FOR SELECT USING (true);



CREATE POLICY "Super Admin Manage Branding" ON "public"."organization_branding" USING ("public"."is_super_admin"());



CREATE POLICY "Super Admin Manage Templates" ON "public"."branding_templates" USING ("public"."is_super_admin"());



CREATE POLICY "Super Admins can insert into audit logs" ON "public"."audit_logs" FOR INSERT WITH CHECK ("public"."is_super_admin"());



CREATE POLICY "Super Admins can insert logs" ON "public"."super_admin_impersonation_log" FOR INSERT WITH CHECK (("auth"."uid"() = "super_admin_id"));



CREATE POLICY "Super Admins can insert logs" ON "public"."user_activity_logs" FOR INSERT WITH CHECK ("public"."is_super_admin"());



CREATE POLICY "Super Admins can manage all invoices" ON "public"."invoices" USING ("public"."is_super_admin"());



CREATE POLICY "Super Admins can manage all org users" ON "public"."organization_users" USING ("public"."is_super_admin"());



CREATE POLICY "Super Admins can manage all organizations" ON "public"."organizations" USING ("public"."is_super_admin"());



CREATE POLICY "Super Admins can manage all quotes" ON "public"."enterprise_quotes" USING ("public"."is_super_admin"());



CREATE POLICY "Super Admins can manage all subscriptions" ON "public"."subscriptions" USING ("public"."is_super_admin"());



CREATE POLICY "Super Admins can manage all transactions" ON "public"."transactions" USING ("public"."is_super_admin"());



CREATE POLICY "Super Admins can select logs" ON "public"."user_activity_logs" FOR SELECT USING ("public"."is_super_admin"());



CREATE POLICY "Super Admins can update own logs" ON "public"."super_admin_impersonation_log" FOR UPDATE USING (("auth"."uid"() = "super_admin_id"));



CREATE POLICY "Super Admins can view audit logs" ON "public"."audit_logs" FOR SELECT USING ("public"."is_super_admin"());



CREATE POLICY "Super Admins can view logs" ON "public"."super_admin_impersonation_log" FOR SELECT USING (("auth"."uid"() = "super_admin_id"));



CREATE POLICY "Super Admins manage permissions" ON "public"."permissions" USING ("public"."is_super_admin"());



CREATE POLICY "Super Admins manage role_permissions" ON "public"."role_permissions" USING ("public"."is_super_admin"());



CREATE POLICY "Super Admins manage roles" ON "public"."roles" USING ("public"."is_super_admin"());



CREATE POLICY "Super admins can manage all payment methods" ON "public"."payment_methods" USING ("public"."is_super_admin"());



CREATE POLICY "Super admins can view all payments" ON "public"."payments" USING ("public"."is_super_admin"());



CREATE POLICY "Super admins can view all renewal audit logs" ON "public"."renewal_audit_log" FOR SELECT USING ("public"."is_super_admin"());



CREATE POLICY "Super admins can view all renewal notifications" ON "public"."renewal_notifications" FOR SELECT USING ("public"."is_super_admin"());



CREATE POLICY "Supervisors/Admins can view org health profiles" ON "public"."health_profiles" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."organization_users"
  WHERE (("organization_users"."user_id" = "auth"."uid"()) AND ("organization_users"."organization_id" = "health_profiles"."organization_id") AND ("organization_users"."role" = ANY (ARRAY['owner'::"text", 'admin'::"text", 'supervisor'::"text"]))))));



CREATE POLICY "System can insert audit logs" ON "public"."organization_audit_logs" FOR INSERT WITH CHECK (true);



CREATE POLICY "System can insert notifications" ON "public"."petrophysics_notifications" FOR INSERT WITH CHECK (true);



CREATE POLICY "System can insert notifications" ON "public"."quick_report_notifications" FOR INSERT WITH CHECK (true);



CREATE POLICY "System insert access logs" ON "public"."access_audit_log" FOR INSERT WITH CHECK (true);



CREATE POLICY "System insert logs" ON "public"."user_activity_logs" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Team can add comments" ON "public"."petrophysics_comments" FOR INSERT WITH CHECK (((EXISTS ( SELECT 1
   FROM "public"."petrophysics_projects"
  WHERE (("petrophysics_projects"."id" = "petrophysics_comments"."project_id") AND ("petrophysics_projects"."user_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."petrophysics_team_members"
  WHERE (("petrophysics_team_members"."project_id" = "petrophysics_comments"."project_id") AND ("petrophysics_team_members"."user_id" = "auth"."uid"()))))));



CREATE POLICY "Team can insert logs" ON "public"."petrophysics_activity_log" FOR INSERT WITH CHECK (true);



CREATE POLICY "Team can send messages" ON "public"."petrophysics_messages" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM ("public"."petrophysics_channels" "c"
     JOIN "public"."petrophysics_team_members" "m" ON (("c"."project_id" = "m"."project_id")))
  WHERE (("c"."id" = "petrophysics_messages"."channel_id") AND ("m"."user_id" = "auth"."uid"())))));



CREATE POLICY "Team can view channels" ON "public"."petrophysics_channels" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."petrophysics_team_members"
  WHERE (("petrophysics_team_members"."project_id" = "petrophysics_channels"."project_id") AND ("petrophysics_team_members"."user_id" = "auth"."uid"())))));



CREATE POLICY "Team can view comments" ON "public"."petrophysics_comments" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."petrophysics_projects"
  WHERE (("petrophysics_projects"."id" = "petrophysics_comments"."project_id") AND ("petrophysics_projects"."user_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."petrophysics_team_members"
  WHERE (("petrophysics_team_members"."project_id" = "petrophysics_comments"."project_id") AND ("petrophysics_team_members"."user_id" = "auth"."uid"()))))));



CREATE POLICY "Team can view logs" ON "public"."petrophysics_activity_log" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."petrophysics_projects"
  WHERE (("petrophysics_projects"."id" = "petrophysics_activity_log"."project_id") AND ("petrophysics_projects"."user_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."petrophysics_team_members"
  WHERE (("petrophysics_team_members"."project_id" = "petrophysics_activity_log"."project_id") AND ("petrophysics_team_members"."user_id" = "auth"."uid"()))))));



CREATE POLICY "Team can view messages" ON "public"."petrophysics_messages" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."petrophysics_channels" "c"
     JOIN "public"."petrophysics_team_members" "m" ON (("c"."project_id" = "m"."project_id")))
  WHERE (("c"."id" = "petrophysics_messages"."channel_id") AND ("m"."user_id" = "auth"."uid"())))));



CREATE POLICY "Team can view versions" ON "public"."petrophysics_project_versions" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."petrophysics_projects"
  WHERE (("petrophysics_projects"."id" = "petrophysics_project_versions"."project_id") AND ("petrophysics_projects"."user_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."petrophysics_team_members"
  WHERE (("petrophysics_team_members"."project_id" = "petrophysics_project_versions"."project_id") AND ("petrophysics_team_members"."user_id" = "auth"."uid"()))))));



CREATE POLICY "Team can view wiki" ON "public"."petrophysics_wiki_pages" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."petrophysics_team_members"
  WHERE (("petrophysics_team_members"."project_id" = "petrophysics_wiki_pages"."project_id") AND ("petrophysics_team_members"."user_id" = "auth"."uid"())))));



CREATE POLICY "Team editors can manage wiki" ON "public"."petrophysics_wiki_pages" USING ((EXISTS ( SELECT 1
   FROM "public"."petrophysics_team_members"
  WHERE (("petrophysics_team_members"."project_id" = "petrophysics_wiki_pages"."project_id") AND ("petrophysics_team_members"."user_id" = "auth"."uid"()) AND ("petrophysics_team_members"."role" = ANY (ARRAY['owner'::"text", 'admin'::"text", 'editor'::"text"]))))));



CREATE POLICY "Team members can access MEMs for shared wells" ON "public"."mems" USING ((EXISTS ( SELECT 1
   FROM "public"."mem_team_access"
  WHERE (("mem_team_access"."well_id" = "mems"."well_id") AND ("mem_team_access"."user_id" = "auth"."uid"())))));



CREATE POLICY "Team members can access data for shared wells" ON "public"."mem_well_data" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."mem_team_access"
  WHERE (("mem_team_access"."well_id" = "mem_well_data"."well_id") AND ("mem_team_access"."user_id" = "auth"."uid"())))));



CREATE POLICY "Team members can access shared wells" ON "public"."mem_wells" USING ((EXISTS ( SELECT 1
   FROM "public"."mem_team_access"
  WHERE (("mem_team_access"."well_id" = "mem_wells"."id") AND ("mem_team_access"."user_id" = "auth"."uid"())))));



CREATE POLICY "Team members can access versions for shared MEMs" ON "public"."mem_versions" USING ((EXISTS ( SELECT 1
   FROM ("public"."mems" "m"
     JOIN "public"."mem_team_access" "ta" ON (("m"."well_id" = "ta"."well_id")))
  WHERE (("m"."id" = "mem_versions"."mem_id") AND ("ta"."user_id" = "auth"."uid"())))));



CREATE POLICY "Team members can manage comments on shared MEMs" ON "public"."mem_comments" USING ((EXISTS ( SELECT 1
   FROM ("public"."mems" "m"
     JOIN "public"."mem_team_access" "ta" ON (("m"."well_id" = "ta"."well_id")))
  WHERE (("m"."id" = "mem_comments"."mem_id") AND ("ta"."user_id" = "auth"."uid"())))));



CREATE POLICY "Team members can view activity on shared wells" ON "public"."mem_activity_log" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."mem_team_access"
  WHERE (("mem_team_access"."well_id" = "mem_activity_log"."well_id") AND ("mem_team_access"."user_id" = "auth"."uid"())))));



CREATE POLICY "Team members can view projects" ON "public"."petrophysics_projects" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."petrophysics_team_members"
  WHERE (("petrophysics_team_members"."project_id" = "petrophysics_team_members"."id") AND ("petrophysics_team_members"."user_id" = "auth"."uid"())))));



CREATE POLICY "Update leaderboard" ON "public"."leaderboard_scores" USING (true);



CREATE POLICY "Update reports" ON "public"."quick_reports" FOR UPDATE USING ((("auth"."uid"() = "created_by_user_id") OR ("auth"."uid"() = "assigned_to") OR (EXISTS ( SELECT 1
   FROM "public"."organization_members"
  WHERE (("organization_members"."organization_id" = "quick_reports"."organization_id") AND ("organization_members"."user_id" = "auth"."uid"()) AND ("organization_members"."role" = ANY (ARRAY['owner'::"text", 'admin'::"text", 'org_admin'::"text", 'super_admin'::"text", 'manager'::"text", 'supervisor'::"text"])))))));



CREATE POLICY "Users add comments to their tickets" ON "public"."support_ticket_comments" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."support_tickets"
  WHERE (("support_tickets"."id" = "support_ticket_comments"."ticket_id") AND ("support_tickets"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can add comments to accessible scenarios" ON "public"."quickvol_comments" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."saved_quickvol_projects" "p"
  WHERE (("p"."id" = "quickvol_comments"."scenario_id") AND (("p"."user_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
           FROM "public"."quickvol_workspace_members" "m"
          WHERE (("m"."workspace_id" = "p"."workspace_id") AND ("m"."user_id" = "auth"."uid"())))))))));



CREATE POLICY "Users can all their own projects" ON "public"."reservoircalc_projects" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can create payments" ON "public"."payments" FOR INSERT WITH CHECK (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Users can create workspaces" ON "public"."quickvol_workspaces" FOR INSERT WITH CHECK (("auth"."uid"() = "owner_id"));



CREATE POLICY "Users can delete own EM wells" ON "public"."em_wells" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete tasks for their projects" ON "public"."tasks" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."projects"
  WHERE (("projects"."id" = "tasks"."project_id") AND ("projects"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can emit events" ON "public"."integration_events" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert notifications" ON "public"."user_notifications" FOR INSERT WITH CHECK (true);



CREATE POLICY "Users can insert own EM wells" ON "public"."em_wells" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert own membership" ON "public"."organization_users" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert own preferences" ON "public"."user_preferences" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert quick reports" ON "public"."quick_reports" FOR INSERT WITH CHECK (("auth"."uid"() = "created_by_user_id"));



CREATE POLICY "Users can insert security incidents" ON "public"."security_incidents" FOR INSERT WITH CHECK (("organization_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can insert tasks for their projects" ON "public"."tasks" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."projects"
  WHERE (("projects"."id" = "tasks"."project_id") AND ("projects"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can insert their org locations" ON "public"."site_locations" FOR INSERT WITH CHECK (("organization_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can insert their own activity" ON "public"."mem_activity_log" FOR INSERT WITH CHECK (true);



CREATE POLICY "Users can insert their own activity logs" ON "public"."app_activity_log" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert validation runs" ON "public"."quickvol_validation_runs" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage AFE budgets for models they access" ON "public"."econ_afe_budgets" USING ((EXISTS ( SELECT 1
   FROM ("public"."econ_models_v2" "m"
     JOIN "public"."econ_projects" "p" ON (("m"."project_id" = "p"."id")))
  WHERE (("m"."id" = "econ_afe_budgets"."model_id") AND (("p"."created_by" = "auth"."uid"()) OR "public"."is_org_member"("p"."org_id"))))));



CREATE POLICY "Users can manage FDP snapshots for models they access" ON "public"."econ_fdp_snapshots" USING ((EXISTS ( SELECT 1
   FROM ("public"."econ_models_v2" "m"
     JOIN "public"."econ_projects" "p" ON (("m"."project_id" = "p"."id")))
  WHERE (("m"."id" = "econ_fdp_snapshots"."model_id") AND (("p"."created_by" = "auth"."uid"()) OR "public"."is_org_member"("p"."org_id"))))));



CREATE POLICY "Users can manage MEMs for their wells" ON "public"."mems" USING ((( SELECT "mem_wells"."user_id"
   FROM "public"."mem_wells"
  WHERE ("mem_wells"."id" = "mems"."well_id")) = "auth"."uid"()));



CREATE POLICY "Users can manage assets in their projects" ON "public"."ss_assets" USING ((("project_id" IN ( SELECT "ss_projects"."id"
   FROM "public"."ss_projects"
  WHERE ("ss_projects"."created_by" = "auth"."uid"()))) OR "public"."is_super_admin"()));



CREATE POLICY "Users can manage calculations for their own MEM projects" ON "public"."mem_calculations" USING ((EXISTS ( SELECT 1
   FROM "public"."mem_projects"
  WHERE (("mem_projects"."id" = "mem_calculations"."project_id") AND ("mem_projects"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can manage casing strings for their wells" ON "public"."casing_strings" USING (((EXISTS ( SELECT 1
   FROM "public"."wells"
  WHERE (("wells"."id" = "casing_strings"."well_id") AND ("wells"."user_id" = "auth"."uid"())))) OR ("auth"."uid"() = "user_id"))) WITH CHECK (((EXISTS ( SELECT 1
   FROM "public"."wells"
  WHERE (("wells"."id" = "casing_strings"."well_id") AND ("wells"."user_id" = "auth"."uid"())))) AND ("auth"."uid"() = "user_id")));



CREATE POLICY "Users can manage changes for their AFEs" ON "public"."afe_changes" USING ((EXISTS ( SELECT 1
   FROM "public"."afes"
  WHERE (("afes"."id" = "afe_changes"."afe_id") AND ("afes"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can manage cost items for their AFEs" ON "public"."afe_cost_items" USING ((EXISTS ( SELECT 1
   FROM "public"."afes"
  WHERE (("afes"."id" = "afe_cost_items"."afe_id") AND ("afes"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can manage curves in their wells" ON "public"."petrophysics_curves" USING ((EXISTS ( SELECT 1
   FROM ("public"."petrophysics_wells" "w"
     JOIN "public"."petrophysics_projects" "p" ON (("w"."project_id" = "p"."id")))
  WHERE (("w"."id" = "petrophysics_curves"."well_id") AND ("p"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can manage data for their wells" ON "public"."mem_well_data" USING ((( SELECT "mem_wells"."user_id"
   FROM "public"."mem_wells"
  WHERE ("mem_wells"."id" = "mem_well_data"."well_id")) = "auth"."uid"()));



CREATE POLICY "Users can manage events in their projects" ON "public"."ss_events" USING ((("project_id" IN ( SELECT "ss_projects"."id"
   FROM "public"."ss_projects"
  WHERE ("ss_projects"."created_by" = "auth"."uid"()))) OR "public"."is_super_admin"()));



CREATE POLICY "Users can manage facilities for their FDP projects" ON "public"."fdp_facilities" USING ((EXISTS ( SELECT 1
   FROM "public"."fdp_projects"
  WHERE (("fdp_projects"."id" = "fdp_facilities"."fdp_project_id") AND ("fdp_projects"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can manage files for their own projects" ON "public"."pta_files" USING ((EXISTS ( SELECT 1
   FROM "public"."pta_projects"
  WHERE (("pta_projects"."id" = "pta_files"."project_id") AND ("pta_projects"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can manage integrations for their projects" ON "public"."pm_integrations" USING ((EXISTS ( SELECT 1
   FROM "public"."projects"
  WHERE (("projects"."id" = "pm_integrations"."project_id") AND ("projects"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can manage interpretations in their projects" ON "public"."ss_interpretations" USING ((("project_id" IN ( SELECT "ss_projects"."id"
   FROM "public"."ss_projects"
  WHERE ("ss_projects"."created_by" = "auth"."uid"()))) OR "public"."is_super_admin"()));



CREATE POLICY "Users can manage invoices for their AFEs" ON "public"."afe_invoices" USING ((EXISTS ( SELECT 1
   FROM "public"."afes"
  WHERE (("afes"."id" = "afe_invoices"."afe_id") AND ("afes"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can manage jobs in their projects" ON "public"."ss_jobs" USING ((("project_id" IN ( SELECT "ss_projects"."id"
   FROM "public"."ss_projects"
  WHERE ("ss_projects"."created_by" = "auth"."uid"()))) OR "public"."is_super_admin"()));



CREATE POLICY "Users can manage links for their portfolios" ON "public"."portfolio_scenario_projects" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage load cases for their wells" ON "public"."load_cases" USING ((EXISTS ( SELECT 1
   FROM "public"."wells"
  WHERE (("wells"."id" = "load_cases"."well_id") AND ("wells"."user_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."wells"
  WHERE (("wells"."id" = "load_cases"."well_id") AND ("wells"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can manage logs for their own MEM projects" ON "public"."mem_well_logs" USING ((EXISTS ( SELECT 1
   FROM "public"."mem_projects"
  WHERE (("mem_projects"."id" = "mem_well_logs"."project_id") AND ("mem_projects"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can manage markers for their own wells" ON "public"."petrophysics_markers" USING ((EXISTS ( SELECT 1
   FROM ("public"."petrophysics_wells" "w"
     JOIN "public"."petrophysics_projects" "p" ON (("w"."project_id" = "p"."id")))
  WHERE (("w"."id" = "petrophysics_markers"."well_id") AND ("p"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can manage mechanical props for their own MEM projects" ON "public"."mem_mechanical_properties" USING ((EXISTS ( SELECT 1
   FROM "public"."mem_projects"
  WHERE (("mem_projects"."id" = "mem_mechanical_properties"."project_id") AND ("mem_projects"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can manage notes for scenarios they can access" ON "public"."econ_scenario_notes" USING ((EXISTS ( SELECT 1
   FROM (("public"."econ_scenarios_v2" "s"
     JOIN "public"."econ_models_v2" "m" ON (("s"."model_id" = "m"."id")))
     JOIN "public"."econ_projects" "p" ON (("m"."project_id" = "p"."id")))
  WHERE (("s"."id" = "econ_scenario_notes"."scenario_id") AND (("p"."created_by" = "auth"."uid"()) OR "public"."is_org_member"("p"."org_id"))))));



CREATE POLICY "Users can manage org documents" ON "public"."documents" USING (true);



CREATE POLICY "Users can manage organization assets" ON "public"."organization_assets" USING (("organization_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can manage own EM grids" ON "public"."em_grids" USING ((EXISTS ( SELECT 1
   FROM "public"."em_projects"
  WHERE (("em_projects"."id" = "em_grids"."project_id") AND ("em_projects"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can manage own EM jobs" ON "public"."em_jobs" USING ((EXISTS ( SELECT 1
   FROM "public"."em_projects"
  WHERE (("em_projects"."id" = "em_jobs"."project_id") AND ("em_projects"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can manage own EM logs" ON "public"."em_well_logs" USING ((EXISTS ( SELECT 1
   FROM ("public"."em_wells"
     JOIN "public"."em_projects" ON (("em_wells"."project_id" = "em_projects"."id")))
  WHERE (("em_wells"."id" = "em_well_logs"."well_id") AND ("em_projects"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can manage own EM projects" ON "public"."em_projects" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage own EM surfaces" ON "public"."em_surfaces" USING ((EXISTS ( SELECT 1
   FROM "public"."em_projects"
  WHERE (("em_projects"."id" = "em_surfaces"."project_id") AND ("em_projects"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can manage own connections" ON "public"."integration_connections" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage own fitness activities" ON "public"."fitness_activities" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage own goals" ON "public"."fitness_goals" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage own health profile" ON "public"."health_profiles" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage own objects" ON "public"."em_objects" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage own petro analyses" ON "public"."em_petro_analyses" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage own petro templates" ON "public"."em_petro_templates" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage own templates" ON "public"."em_object_templates" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage own workflows" ON "public"."integration_workflows" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage predictions for their org" ON "public"."predictions" USING (("organization_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can manage pressure data for their own MEM projects" ON "public"."mem_pressure_data" USING ((EXISTS ( SELECT 1
   FROM "public"."mem_projects"
  WHERE (("mem_projects"."id" = "mem_pressure_data"."project_id") AND ("mem_projects"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can manage price decks for their FDP projects" ON "public"."fdp_price_decks" USING ((EXISTS ( SELECT 1
   FROM "public"."fdp_projects"
  WHERE (("fdp_projects"."id" = "fdp_price_decks"."fdp_project_id") AND ("fdp_projects"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can manage reserves for their wells" ON "public"."petrophysics_reserves" USING ((EXISTS ( SELECT 1
   FROM ("public"."petrophysics_wells" "w"
     JOIN "public"."petrophysics_projects" "p" ON (("w"."project_id" = "p"."id")))
  WHERE (("w"."id" = "petrophysics_reserves"."well_id") AND ("p"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can manage resources for their projects" ON "public"."resources" USING ((EXISTS ( SELECT 1
   FROM "public"."projects"
  WHERE (("projects"."id" = "resources"."project_id") AND ("projects"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can manage risks for their projects" ON "public"."risks" USING ((EXISTS ( SELECT 1
   FROM "public"."projects"
  WHERE (("projects"."id" = "risks"."project_id") AND ("projects"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can manage runs for their own projects" ON "public"."pta_runs" USING ((EXISTS ( SELECT 1
   FROM "public"."pta_projects"
  WHERE (("pta_projects"."id" = "pta_runs"."project_id") AND ("pta_projects"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can manage styles in their projects" ON "public"."ss_styles" USING (("public"."is_super_admin"() OR ("project_id" IN ( SELECT "ss_projects"."id"
   FROM "public"."ss_projects"
  WHERE ("ss_projects"."created_by" = "auth"."uid"())))));



CREATE POLICY "Users can manage their own AFEs" ON "public"."afes" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own API keys" ON "public"."quickvol_api_keys" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own EPE cases" ON "public"."epe_cases" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own EPE results" ON "public"."epe_results" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own EPE runs" ON "public"."epe_runs" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own MEM jobs" ON "public"."mem_edge_function_jobs" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own MEM projects" ON "public"."mem_projects" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own PVT projects" ON "public"."saved_pvt_projects" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own QC reports" ON "public"."petrophysics_qc_reports" USING ((EXISTS ( SELECT 1
   FROM "public"."petrophysics_projects"
  WHERE (("petrophysics_projects"."id" = "petrophysics_qc_reports"."project_id") AND ("petrophysics_projects"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can manage their own RTO projects" ON "public"."rto_projects" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own activities" ON "public"."reservoir_activities" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own alerts" ON "public"."alerts" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own allocations" ON "public"."allocations" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own analyses" ON "public"."reservoir_analyses" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own batch jobs" ON "public"."mem_batch_jobs" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own bf_projects" ON "public"."bf_projects" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own calibration data" ON "public"."calibration_data" USING ((EXISTS ( SELECT 1
   FROM "public"."expert_mode_sessions"
  WHERE (("expert_mode_sessions"."id" = "calibration_data"."session_id") AND ("expert_mode_sessions"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can manage their own capex data" ON "public"."epe_capex" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own cementing projects" ON "public"."cementing_simulation_projects" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own connectors" ON "public"."connectors" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own correlation lines" ON "public"."petrophysics_correlation_lines" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own correlation projects" ON "public"."well_correlation_projects" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own data" ON "public"."anticollision_checks" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own data" ON "public"."bhas" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own data" ON "public"."casing_schemes" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own data" ON "public"."cement_jobs" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own data" ON "public"."completion_plans" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own data" ON "public"."contour_projects" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own data" ON "public"."events" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own data" ON "public"."fdp_projects" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own data" ON "public"."frac_vault" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own data" ON "public"."geomech_measurements" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own data" ON "public"."geomech_params" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own data" ON "public"."geomech_velocity" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own data" ON "public"."hydraulics_runs" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own data" ON "public"."mud_programs" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own data" ON "public"."offset_surveys" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own data" ON "public"."offset_wells" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own data" ON "public"."pressure_gradients" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own data" ON "public"."projects" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own data" ON "public"."pvt_results" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own data" ON "public"."rto_connections" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own data" ON "public"."rto_settings" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own data" ON "public"."saved_casing_design_projects" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own data" ON "public"."saved_compressor_pump_projects" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own data" ON "public"."saved_dca_projects" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own data" ON "public"."saved_drilling_fluids_projects" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own data" ON "public"."saved_heat_exchanger_projects" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own data" ON "public"."saved_mbal_projects" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own data" ON "public"."saved_nodal_analysis_projects" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own data" ON "public"."saved_petrophysics_projects" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own data" ON "public"."saved_pvt_projects" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own data" ON "public"."saved_quickvol_projects" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own data" ON "public"."saved_relief_projects" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own data" ON "public"."saved_report_autopilot_projects" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own data" ON "public"."saved_well_cost_iq_projects" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own data" ON "public"."saved_well_cost_projects" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own data" ON "public"."surveys" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own data" ON "public"."torque_drag_runs" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own data" ON "public"."trajectory_plans" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own data" ON "public"."well_targets" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own data" ON "public"."wells" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own data uploads" ON "public"."data_uploads" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own designs" ON "public"."artificial_lift_designs" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own digitizer projects" ON "public"."log_digitizer_projects" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own expert sessions" ON "public"."expert_mode_sessions" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own fiscal regime projects" ON "public"."fiscal_regime_projects" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own flow assurance projects" ON "public"."flow_assurance_projects" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own fluid studio projects" ON "public"."fluid_studio_projects" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own frac projects" ON "public"."frac_completion_projects" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own geomechanics projects" ON "public"."geomechanics_projects" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own jobs" ON "public"."bf_jobs" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own layouts" ON "public"."facility_layouts" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own monte carlo runs" ON "public"."petrophysics_monte_carlo_runs" USING ((EXISTS ( SELECT 1
   FROM "public"."petrophysics_projects"
  WHERE (("petrophysics_projects"."id" = "petrophysics_monte_carlo_runs"."project_id") AND ("petrophysics_projects"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can manage their own opex data" ON "public"."epe_opex" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own pipeline sizer projects" ON "public"."saved_pipeline_sizer_projects" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own portfolio projects" ON "public"."portfolio_projects" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own portfolios" ON "public"."portfolios" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own production data" ON "public"."epe_production_volumes" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own production data" ON "public"."production_data" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own projects" ON "public"."log_facies_projects" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own projects" ON "public"."petrophysics_projects" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own projects" ON "public"."ss_projects" USING ((("created_by" = "auth"."uid"()) OR "public"."is_super_admin"()));



CREATE POLICY "Users can manage their own property overrides" ON "public"."property_overrides" USING ((EXISTS ( SELECT 1
   FROM "public"."expert_mode_sessions"
  WHERE (("expert_mode_sessions"."id" = "property_overrides"."session_id") AND ("expert_mode_sessions"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can manage their own pta_projects" ON "public"."pta_projects" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own reports" ON "public"."quickvol_generated_reports" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own reports" ON "public"."reports" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own reservoir balance projects" ON "public"."saved_reservoir_balance_projects" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own reservoirs" ON "public"."reservoirs" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own scenarios" ON "public"."mem_scenarios" USING ((EXISTS ( SELECT 1
   FROM "public"."expert_mode_sessions"
  WHERE (("expert_mode_sessions"."id" = "mem_scenarios"."session_id") AND ("expert_mode_sessions"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can manage their own shared data" ON "public"."shared_data_registry" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own sim cases" ON "public"."sim_cases" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own sim projects" ON "public"."sim_projects" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own snapshots" ON "public"."integration_snapshots" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own stress overrides" ON "public"."stress_overrides" USING ((EXISTS ( SELECT 1
   FROM "public"."expert_mode_sessions"
  WHERE (("expert_mode_sessions"."id" = "stress_overrides"."session_id") AND ("expert_mode_sessions"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can manage their own surveillance projects" ON "public"."production_surveillance_projects" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own telemetry" ON "public"."pta_telemetry" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own templates" ON "public"."quickvol_report_templates" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own torque and drag projects" ON "public"."torque_drag_projects" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own versions" ON "public"."bf_versions" USING (("created_by" = "auth"."uid"()));



CREATE POLICY "Users can manage their own waterflood projects" ON "public"."waterflood_projects" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own webhooks" ON "public"."quickvol_webhooks" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own wellbore flow projects" ON "public"."wellbore_flow_projects" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own wells" ON "public"."bf_wells" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own wells" ON "public"."mem_wells" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their saved moments" ON "public"."user_saved_moments" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage training logs for their org" ON "public"."model_training_logs" USING (("organization_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can manage trajectories for their own MEM projects" ON "public"."mem_trajectories" USING ((EXISTS ( SELECT 1
   FROM "public"."mem_projects"
  WHERE (("mem_projects"."id" = "mem_trajectories"."project_id") AND ("mem_projects"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can manage updates for their projects" ON "public"."project_updates" USING ((EXISTS ( SELECT 1
   FROM "public"."projects"
  WHERE (("projects"."id" = "project_updates"."project_id") AND ("projects"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can manage versions for their MEMs" ON "public"."mem_versions" USING ((EXISTS ( SELECT 1
   FROM ("public"."mems" "m"
     JOIN "public"."mem_wells" "w" ON (("m"."well_id" = "w"."id")))
  WHERE (("m"."id" = "mem_versions"."mem_id") AND ("w"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can manage wells for their FDP projects" ON "public"."fdp_wells" USING ((EXISTS ( SELECT 1
   FROM "public"."fdp_projects"
  WHERE (("fdp_projects"."id" = "fdp_wells"."fdp_project_id") AND ("fdp_projects"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can manage wells for their own correlation projects" ON "public"."well_correlation_wells" USING ((("auth"."uid"() = "user_id") AND ("project_id" IN ( SELECT "well_correlation_projects"."id"
   FROM "public"."well_correlation_projects"
  WHERE ("well_correlation_projects"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can manage wells in their projects" ON "public"."petrophysics_wells" USING ((EXISTS ( SELECT 1
   FROM "public"."petrophysics_projects"
  WHERE (("petrophysics_projects"."id" = "petrophysics_wells"."project_id") AND ("petrophysics_projects"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can manage workflow runs for their workflows" ON "public"."ss_workflow_runs" USING ((("workflow_id" IN ( SELECT "ss_workflows"."id"
   FROM "public"."ss_workflows"
  WHERE ("ss_workflows"."project_id" IN ( SELECT "ss_projects"."id"
           FROM "public"."ss_projects"
          WHERE ("ss_projects"."created_by" = "auth"."uid"()))))) OR "public"."is_super_admin"()));



CREATE POLICY "Users can manage workflows in their projects" ON "public"."ss_workflows" USING ((("project_id" IN ( SELECT "ss_projects"."id"
   FROM "public"."ss_projects"
  WHERE ("ss_projects"."created_by" = "auth"."uid"()))) OR "public"."is_super_admin"()));



CREATE POLICY "Users can read events" ON "public"."integration_events" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can read public templates" ON "public"."em_object_templates" FOR SELECT USING ((("is_public" = true) OR ("auth"."uid"() = "user_id")));



CREATE POLICY "Users can read shared data linked to their organization" ON "public"."shared_data_registry" FOR SELECT USING ((("auth"."uid"() = "user_id") OR ("is_public_to_org" = true)));



CREATE POLICY "Users can select own EM wells" ON "public"."em_wells" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can select tasks for their projects" ON "public"."tasks" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."projects"
  WHERE (("projects"."id" = "tasks"."project_id") AND ("projects"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can update own EM wells" ON "public"."em_wells" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own invitations" ON "public"."invitations" FOR UPDATE TO "authenticated" USING (("email" = ( SELECT ("auth"."jwt"() ->> 'email'::"text"))));



CREATE POLICY "Users can update own membership" ON "public"."organization_users" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own preferences" ON "public"."user_preferences" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update tasks for their projects" ON "public"."tasks" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."projects"
  WHERE (("projects"."id" = "tasks"."project_id") AND ("projects"."user_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."projects"
  WHERE (("projects"."id" = "tasks"."project_id") AND ("projects"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can update their org locations" ON "public"."site_locations" FOR UPDATE USING (("organization_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can update their own data" ON "public"."users" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can update their own notifications" ON "public"."user_notifications" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view apps their org has purchased" ON "public"."master_apps" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM ("public"."purchased_modules" "pm"
     JOIN "public"."organization_users" "ou" ON (("pm"."organization_id" = "ou"."organization_id")))
  WHERE (("ou"."user_id" = "auth"."uid"()) AND ("pm"."status" = 'active'::"text") AND ("pm"."expiry_date" > "now"()) AND (("pm"."app_uuid" = "master_apps"."id") OR (("pm"."app_uuid" IS NULL) AND ("pm"."module_uuid" = "master_apps"."module_id")))))) OR ("auth"."role"() = 'service_role'::"text")));



CREATE POLICY "Users can view comments on accessible scenarios" ON "public"."quickvol_comments" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."saved_quickvol_projects" "p"
  WHERE (("p"."id" = "quickvol_comments"."scenario_id") AND (("p"."user_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
           FROM "public"."quickvol_workspace_members" "m"
          WHERE (("m"."workspace_id" = "p"."workspace_id") AND ("m"."user_id" = "auth"."uid"())))))))));



CREATE POLICY "Users can view invoices for their own org" ON "public"."invoices" FOR SELECT USING (("organization_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can view logs on accessible scenarios" ON "public"."quickvol_activity_logs" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."saved_quickvol_projects" "p"
  WHERE (("p"."id" = "quickvol_activity_logs"."scenario_id") AND (("p"."user_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
           FROM "public"."quickvol_workspace_members" "m"
          WHERE (("m"."workspace_id" = "p"."workspace_id") AND ("m"."user_id" = "auth"."uid"())))))))));



CREATE POLICY "Users can view org alerts" ON "public"."alerts" FOR SELECT USING (("organization_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can view org documents" ON "public"."documents" FOR SELECT USING (true);



CREATE POLICY "Users can view org environment metrics" ON "public"."environment_metrics" FOR SELECT USING (("organization_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can view org fitness (for leaderboard)" ON "public"."fitness_activities" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."organization_users"
  WHERE (("organization_users"."user_id" = "auth"."uid"()) AND ("organization_users"."organization_id" = "fitness_activities"."organization_id")))));



CREATE POLICY "Users can view org health metrics" ON "public"."health_metrics" FOR SELECT USING (("organization_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can view org members" ON "public"."organization_users" FOR SELECT USING (("organization_id" = ANY ("public"."get_my_org_ids"())));



CREATE POLICY "Users can view org recommendations" ON "public"."recommendations" FOR SELECT USING (("organization_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can view org security incidents" ON "public"."security_incidents" FOR SELECT USING (("organization_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can view own audit logs" ON "public"."integration_audit_log" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own health profile" ON "public"."health_profiles" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own membership" ON "public"."organization_users" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own notifications" ON "public"."petrophysics_notifications" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own preferences" ON "public"."user_preferences" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own profile" ON "public"."organization_users" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own sync history" ON "public"."integration_sync_history" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view predictions for their org" ON "public"."predictions" FOR SELECT USING (("organization_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can view public templates" ON "public"."quickvol_report_templates" FOR SELECT USING (("is_public" = true));



CREATE POLICY "Users can view purchased apps" ON "public"."master_apps" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."purchased_modules" "pm"
     JOIN "public"."organization_users" "ou" ON (("pm"."organization_id" = "ou"."organization_id")))
  WHERE (("ou"."user_id" = "auth"."uid"()) AND ("pm"."status" = 'active'::"text") AND ("pm"."expiry_date" > "now"()) AND (("pm"."app_uuid" = "master_apps"."id") OR (("pm"."app_uuid" IS NULL) AND ("pm"."module_uuid" = "master_apps"."module_id")))))));



CREATE POLICY "Users can view settings for their orgs" ON "public"."org_settings" FOR SELECT USING ((("org_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))) OR "public"."is_super_admin"()));



CREATE POLICY "Users can view team members" ON "public"."petrophysics_team_members" FOR SELECT USING ((("user_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."petrophysics_projects"
  WHERE (("petrophysics_projects"."id" = "petrophysics_team_members"."project_id") AND ("petrophysics_projects"."user_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."petrophysics_team_members" "petrophysics_team_members_1"
  WHERE (("petrophysics_team_members_1"."project_id" = "petrophysics_team_members_1"."project_id") AND ("petrophysics_team_members_1"."user_id" = "auth"."uid"()))))));



CREATE POLICY "Users can view their org locations" ON "public"."site_locations" FOR SELECT USING (("organization_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can view their organization's usage" ON "public"."usage_metrics" FOR SELECT USING (("organization_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can view their own access" ON "public"."mem_team_access" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own activity logs" ON "public"."app_activity_log" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own app access" ON "public"."user_app_access" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own data" ON "public"."users" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can view their own logs" ON "public"."quickvol_integration_logs" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own notifications" ON "public"."quick_report_notifications" FOR SELECT USING (("auth"."uid"() = "recipient_user_id"));



CREATE POLICY "Users can view their own notifications" ON "public"."user_notifications" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own org's subscription" ON "public"."subscriptions" FOR SELECT USING (("organization_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can view their own organization" ON "public"."organizations" FOR SELECT USING (("public"."is_super_admin"() OR ("id" = ANY ("public"."get_my_org_ids"()))));



CREATE POLICY "Users can view their own validation runs" ON "public"."quickvol_validation_runs" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view training logs for their org" ON "public"."model_training_logs" FOR SELECT USING (("organization_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "Users can view versions on accessible scenarios" ON "public"."quickvol_versions" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."saved_quickvol_projects" "p"
  WHERE (("p"."id" = "quickvol_versions"."scenario_id") AND (("p"."user_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
           FROM "public"."quickvol_workspace_members" "m"
          WHERE (("m"."workspace_id" = "p"."workspace_id") AND ("m"."user_id" = "auth"."uid"())))))))));



CREATE POLICY "Users can view workspaces they are members of" ON "public"."quickvol_workspaces" FOR SELECT USING ((("auth"."uid"() = "owner_id") OR (EXISTS ( SELECT 1
   FROM "public"."quickvol_workspace_members"
  WHERE (("quickvol_workspace_members"."workspace_id" = "quickvol_workspaces"."id") AND ("quickvol_workspace_members"."user_id" = "auth"."uid"()))))));



CREATE POLICY "Users create run configs for their cases" ON "public"."epe_run_configs" FOR INSERT WITH CHECK ((("auth"."uid"() = "user_id") AND ("case_id" IN ( SELECT "epe_cases"."id"
   FROM "public"."epe_cases"
  WHERE ("epe_cases"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users create tickets" ON "public"."support_tickets" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users delete their own run configs" ON "public"."epe_run_configs" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users insert own profile" ON "public"."user_profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users manage own currency" ON "public"."user_currency_preference" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users update own profile" ON "public"."user_profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Users update their own run configs" ON "public"."epe_run_configs" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users view comments on their tickets" ON "public"."support_ticket_comments" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."support_tickets"
  WHERE (("support_tickets"."id" = "support_ticket_comments"."ticket_id") AND ("support_tickets"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users view own logs" ON "public"."user_activity_logs" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users view own profile" ON "public"."user_profiles" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "Users view own tickets" ON "public"."support_tickets" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users view their own run configs" ON "public"."epe_run_configs" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "View accessible quick reports" ON "public"."quick_reports" FOR SELECT USING ((("auth"."uid"() = "created_by_user_id") OR ("auth"."uid"() = "assigned_to") OR (EXISTS ( SELECT 1
   FROM "public"."quick_report_notifications"
  WHERE (("quick_report_notifications"."quick_report_id" = "quick_reports"."id") AND ("quick_report_notifications"."recipient_user_id" = "auth"."uid"())))) OR (EXISTS ( SELECT 1
   FROM "public"."organization_members"
  WHERE (("organization_members"."organization_id" = "quick_reports"."organization_id") AND ("organization_members"."user_id" = "auth"."uid"()) AND ("organization_members"."role" = ANY (ARRAY['owner'::"text", 'admin'::"text", 'org_admin'::"text", 'super_admin'::"text", 'manager'::"text", 'supervisor'::"text"])))))));



CREATE POLICY "View activity" ON "public"."bf_activity_log" FOR SELECT USING (true);



CREATE POLICY "View attachments" ON "public"."incident_attachments" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."incidents"
  WHERE (("incidents"."id" = "incident_attachments"."incident_id") AND (("incidents"."created_by" = "auth"."uid"()) OR (EXISTS ( SELECT 1
           FROM "public"."organization_users"
          WHERE (("organization_users"."user_id" = "auth"."uid"()) AND ("organization_users"."organization_id" = "incidents"."organization_id") AND ("organization_users"."role" = ANY (ARRAY['owner'::"text", 'admin'::"text", 'supervisor'::"text"]))))))))));



CREATE POLICY "View comments" ON "public"."bf_comments" FOR SELECT USING (true);



CREATE POLICY "View comments" ON "public"."incident_comments" FOR SELECT USING (true);



CREATE POLICY "View leaderboard" ON "public"."leaderboard_scores" FOR SELECT USING (true);



CREATE POLICY "View media" ON "public"."quick_report_media" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."quick_reports"
  WHERE (("quick_reports"."id" = "quick_report_media"."report_id") AND (("quick_reports"."created_by_user_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
           FROM "public"."organization_users"
          WHERE (("organization_users"."user_id" = "auth"."uid"()) AND ("organization_users"."organization_id" = "quick_reports"."organization_id") AND ("organization_users"."role" = ANY (ARRAY['owner'::"text", 'admin'::"text", 'supervisor'::"text"]))))))))));



CREATE POLICY "View members of own orgs" ON "public"."org_members" FOR SELECT USING ("public"."is_org_member"("org_id"));



CREATE POLICY "View org analytics" ON "public"."analytics_insights" FOR SELECT USING (("organization_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "View org history" ON "public"."leaderboard_history" FOR SELECT USING (("organization_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "View org leaderboard" ON "public"."leaderboard_scores" FOR SELECT USING (("organization_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "View org trends" ON "public"."trend_analysis" FOR SELECT USING (("organization_id" IN ( SELECT "organization_users"."organization_id"
   FROM "public"."organization_users"
  WHERE ("organization_users"."user_id" = "auth"."uid"()))));



CREATE POLICY "View organizations member of" ON "public"."organizations" FOR SELECT USING ("public"."is_org_member"("id"));



CREATE POLICY "View own notifications" ON "public"."quick_report_notifications" FOR SELECT USING (("auth"."uid"() = "recipient_user_id"));



CREATE POLICY "View team members" ON "public"."bf_team_members" FOR SELECT USING (("auth"."uid"() IN ( SELECT "bf_team_members_1"."user_id"
   FROM "public"."bf_team_members" "bf_team_members_1"
  WHERE ("bf_team_members_1"."project_id" = "bf_team_members_1"."project_id"))));



CREATE POLICY "Well owners can manage team access" ON "public"."mem_team_access" USING ((EXISTS ( SELECT 1
   FROM "public"."mem_team_access" "mem_team_access_1"
  WHERE (("mem_team_access_1"."well_id" = "mem_team_access_1"."well_id") AND ("mem_team_access_1"."user_id" = "auth"."uid"()) AND ("mem_team_access_1"."access_level" = 'owner'::"text"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."mem_team_access" "mem_team_access_1"
  WHERE (("mem_team_access_1"."well_id" = "mem_team_access_1"."well_id") AND ("mem_team_access_1"."user_id" = "auth"."uid"()) AND ("mem_team_access_1"."access_level" = 'owner'::"text")))));



ALTER TABLE "public"."absence_records" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."access_audit_log" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."access_requests" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."afe_changes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."afe_cost_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."afe_invoices" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."afes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."alerts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."allocations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."analytics_insights" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."annuli" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."anticollision_checks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."app_activity_log" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."app_analytics_daily" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."app_seat_assignments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."artificial_lift_designs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."audit_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."available_modules" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."bf_activity_log" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."bf_comments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."bf_jobs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."bf_projects" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."bf_team_members" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."bf_versions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."bf_wells" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."bhas" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."billing_reports" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."branding_templates" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."bulk_import_jobs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."calc_runs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."calibration_data" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."casing_schemes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."casing_strings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cement_jobs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."completion_plans" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."compliance_rules" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."connectors" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."contour_projects" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."custom_fields" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."custom_workflows" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."data_uploads" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "delete_organization_members" ON "public"."organization_members" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."organization_users" "ou"
  WHERE (("ou"."organization_id" = "organization_members"."organization_id") AND ("ou"."user_id" = "auth"."uid"()) AND ("ou"."role" = ANY (ARRAY['owner'::"text", 'admin'::"text", 'org_admin'::"text", 'super_admin'::"text"]))))));



ALTER TABLE "public"."demo_requests" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."departments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."discount_codes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."documents" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."drilling_incidents" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."econ_afe_budgets" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."econ_audit_log" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "econ_audit_log_insert" ON "public"."econ_audit_log" FOR INSERT WITH CHECK ("public"."is_org_member"("org_id"));



CREATE POLICY "econ_audit_log_select" ON "public"."econ_audit_log" FOR SELECT USING ("public"."is_org_member"("org_id"));



ALTER TABLE "public"."econ_fdp_snapshots" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."econ_fiscal_terms" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "econ_fiscal_terms_all" ON "public"."econ_fiscal_terms" USING ((EXISTS ( SELECT 1
   FROM (("public"."econ_scenarios" "s"
     JOIN "public"."econ_models" "m" ON (("s"."model_id" = "m"."id")))
     JOIN "public"."econ_projects" "p" ON (("m"."project_id" = "p"."id")))
  WHERE (("s"."id" = "econ_fiscal_terms"."scenario_id") AND "public"."is_org_member"("p"."org_id")))));



ALTER TABLE "public"."econ_imports" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "econ_imports_all" ON "public"."econ_imports" USING ((EXISTS ( SELECT 1
   FROM ("public"."econ_models_v2" "m"
     JOIN "public"."econ_projects" "p" ON (("m"."project_id" = "p"."id")))
  WHERE (("m"."id" = "econ_imports"."model_id") AND (("p"."created_by" = "auth"."uid"()) OR "public"."is_org_member"("p"."org_id"))))));



ALTER TABLE "public"."econ_inputs" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "econ_inputs_all" ON "public"."econ_inputs" USING ((EXISTS ( SELECT 1
   FROM (("public"."econ_scenarios" "s"
     JOIN "public"."econ_models" "m" ON (("s"."model_id" = "m"."id")))
     JOIN "public"."econ_projects" "p" ON (("m"."project_id" = "p"."id")))
  WHERE (("s"."id" = "econ_inputs"."scenario_id") AND "public"."is_org_member"("p"."org_id")))));



ALTER TABLE "public"."econ_line_items" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "econ_line_items_all" ON "public"."econ_line_items" USING ((EXISTS ( SELECT 1
   FROM (("public"."econ_scenarios" "s"
     JOIN "public"."econ_models" "m" ON (("s"."model_id" = "m"."id")))
     JOIN "public"."econ_projects" "p" ON (("m"."project_id" = "p"."id")))
  WHERE (("s"."id" = "econ_line_items"."scenario_id") AND "public"."is_org_member"("p"."org_id")))));



ALTER TABLE "public"."econ_metrics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."econ_models" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "econ_models_delete" ON "public"."econ_models" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."econ_projects"
  WHERE (("econ_projects"."id" = "econ_models"."project_id") AND "public"."is_org_member"("econ_projects"."org_id")))));



CREATE POLICY "econ_models_insert" ON "public"."econ_models" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."econ_projects"
  WHERE (("econ_projects"."id" = "econ_models"."project_id") AND "public"."is_org_member"("econ_projects"."org_id")))));



CREATE POLICY "econ_models_modify" ON "public"."econ_models" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."econ_projects"
  WHERE (("econ_projects"."id" = "econ_models"."project_id") AND "public"."is_org_member"("econ_projects"."org_id")))));



CREATE POLICY "econ_models_select" ON "public"."econ_models" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."econ_projects"
  WHERE (("econ_projects"."id" = "econ_models"."project_id") AND "public"."is_org_member"("econ_projects"."org_id")))));



ALTER TABLE "public"."econ_models_v2" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "econ_models_v2_delete" ON "public"."econ_models_v2" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."econ_projects" "p"
  WHERE (("p"."id" = "econ_models_v2"."project_id") AND (("p"."created_by" = "auth"."uid"()) OR "public"."is_org_member"("p"."org_id"))))));



CREATE POLICY "econ_models_v2_insert" ON "public"."econ_models_v2" FOR INSERT WITH CHECK (true);



CREATE POLICY "econ_models_v2_select" ON "public"."econ_models_v2" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."econ_projects" "p"
  WHERE (("p"."id" = "econ_models_v2"."project_id") AND (("p"."created_by" = "auth"."uid"()) OR "public"."is_org_member"("p"."org_id"))))));



CREATE POLICY "econ_models_v2_update" ON "public"."econ_models_v2" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."econ_projects" "p"
  WHERE (("p"."id" = "econ_models_v2"."project_id") AND (("p"."created_by" = "auth"."uid"()) OR "public"."is_org_member"("p"."org_id"))))));



ALTER TABLE "public"."econ_projects" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "econ_projects_delete" ON "public"."econ_projects" FOR DELETE USING ("public"."is_org_member"("org_id"));



CREATE POLICY "econ_projects_insert" ON "public"."econ_projects" FOR INSERT TO "authenticated" WITH CHECK ("public"."is_org_member"("org_id"));



CREATE POLICY "econ_projects_select" ON "public"."econ_projects" FOR SELECT USING ("public"."is_org_member"("org_id"));



CREATE POLICY "econ_projects_update" ON "public"."econ_projects" FOR UPDATE USING ("public"."is_org_member"("org_id"));



ALTER TABLE "public"."econ_results" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "econ_results_all" ON "public"."econ_results" USING ((EXISTS ( SELECT 1
   FROM (("public"."econ_scenarios" "s"
     JOIN "public"."econ_models" "m" ON (("s"."model_id" = "m"."id")))
     JOIN "public"."econ_projects" "p" ON (("m"."project_id" = "p"."id")))
  WHERE (("s"."id" = "econ_results"."scenario_id") AND "public"."is_org_member"("p"."org_id")))));



ALTER TABLE "public"."econ_scenario_notes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."econ_scenarios" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "econ_scenarios_all" ON "public"."econ_scenarios" USING ((EXISTS ( SELECT 1
   FROM ("public"."econ_models" "m"
     JOIN "public"."econ_projects" "p" ON (("m"."project_id" = "p"."id")))
  WHERE (("m"."id" = "econ_scenarios"."model_id") AND "public"."is_org_member"("p"."org_id")))));



ALTER TABLE "public"."econ_scenarios_v2" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "econ_scenarios_v2_all" ON "public"."econ_scenarios_v2" USING ((EXISTS ( SELECT 1
   FROM ("public"."econ_models_v2" "m"
     JOIN "public"."econ_projects" "p" ON (("m"."project_id" = "p"."id")))
  WHERE (("m"."id" = "econ_scenarios_v2"."model_id") AND (("p"."created_by" = "auth"."uid"()) OR "public"."is_org_member"("p"."org_id"))))));



ALTER TABLE "public"."econ_sensitivity_results" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "econ_sensitivity_results_all" ON "public"."econ_sensitivity_results" USING ((EXISTS ( SELECT 1
   FROM (("public"."econ_scenarios_v2" "s"
     JOIN "public"."econ_models_v2" "m" ON (("s"."model_id" = "m"."id")))
     JOIN "public"."econ_projects" "p" ON (("m"."project_id" = "p"."id")))
  WHERE (("s"."id" = "econ_sensitivity_results"."scenario_id") AND (("p"."created_by" = "auth"."uid"()) OR "public"."is_org_member"("p"."org_id"))))));



ALTER TABLE "public"."econ_timegrid" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "econ_timegrid_all" ON "public"."econ_timegrid" USING ((EXISTS ( SELECT 1
   FROM ("public"."econ_models" "m"
     JOIN "public"."econ_projects" "p" ON (("m"."project_id" = "p"."id")))
  WHERE (("m"."id" = "econ_timegrid"."model_id") AND "public"."is_org_member"("p"."org_id")))));



ALTER TABLE "public"."em_fault_sticks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."em_faults" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."em_grid_properties" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."em_grids" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."em_jobs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."em_object_templates" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."em_objects" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."em_petro_analyses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."em_petro_templates" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."em_projects" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."em_surface_points" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."em_surfaces" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."em_volumes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."em_well_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."em_wells" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."employee_app_access" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."employee_storage" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."enterprise_quotes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."environment_emp_actions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."environment_facilities" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."environment_flaring_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."environment_metrics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."environment_monitoring_results" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."environment_obligations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."environment_permits" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."environment_spill_reports" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."environment_studies" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."environment_waste_manifests" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."environmental_monitoring" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."epe_capex" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."epe_cases" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."epe_opex" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."epe_production_volumes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."epe_results" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."epe_run_configs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."epe_runs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."epe_sensitivity_results" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."epe_sensitivity_runs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."expert_mode_sessions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."facility_layouts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."fdp_facilities" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."fdp_price_decks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."fdp_projects" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."fdp_wells" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."fire_drills" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."fire_emergency_response_plans" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."fire_equipment_inventory" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."fire_equipment_maintenance" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."fire_incident_investigation" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."fire_incidents" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."fire_safety_compliance" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."fire_safety_risks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."fiscal_regime_projects" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."fitness_activities" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."fitness_goals" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."flow_assurance_projects" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."fluid_studio_projects" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."frac_vault" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."geomech_measurements" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."geomech_params" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."geomech_velocity" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."gm_curves" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."gm_datasets" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."gm_events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."gm_models" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."gm_run_points" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."gm_runs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."gm_wells" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."hazard_assessments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."health_metrics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."health_profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."health_screenings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."help_articles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."help_categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."hydraulics_runs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."incident_attachments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."incident_comments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."incidents" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "insert_organization_members" ON "public"."organization_members" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."organization_users" "ou"
  WHERE (("ou"."organization_id" = "organization_members"."organization_id") AND ("ou"."user_id" = "auth"."uid"()) AND ("ou"."role" = ANY (ARRAY['owner'::"text", 'admin'::"text", 'org_admin'::"text", 'super_admin'::"text"]))))));



ALTER TABLE "public"."integration_audit_log" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."integration_connections" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."integration_events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."integration_snapshots" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."integration_sync_history" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."integration_workflows" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "interp_mutate" ON "public"."ss_interpretations" USING (("public"."can_edit_project"("project_id") OR ("auth"."role"() = 'service_role'::"text"))) WITH CHECK (("public"."can_edit_project"("project_id") OR ("auth"."role"() = 'service_role'::"text")));



CREATE POLICY "interp_select" ON "public"."ss_interpretations" FOR SELECT USING (("public"."is_project_member"("project_id") OR ("auth"."role"() = 'service_role'::"text")));



ALTER TABLE "public"."invitations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."invoices" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "jobs_insert" ON "public"."ss_jobs" FOR INSERT WITH CHECK (("public"."can_edit_project"("project_id") OR ("auth"."role"() = 'service_role'::"text")));



CREATE POLICY "jobs_select" ON "public"."ss_jobs" FOR SELECT USING (("public"."is_project_member"("project_id") OR ("auth"."role"() = 'service_role'::"text")));



CREATE POLICY "jobs_update" ON "public"."ss_jobs" FOR UPDATE USING (("auth"."role"() = 'service_role'::"text")) WITH CHECK (("auth"."role"() = 'service_role'::"text"));



ALTER TABLE "public"."leaderboard_history" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."leaderboard_scores" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."load_cases" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."log_digitizer_projects" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."log_facies_projects" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."lookup_additives" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."lookup_casing_grades" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."master_apps" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."medical_certifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."mem_activity_log" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."mem_batch_jobs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."mem_calculations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."mem_comments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."mem_edge_function_jobs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."mem_mechanical_properties" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."mem_pressure_data" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."mem_projects" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."mem_scenarios" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."mem_team_access" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."mem_trajectories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."mem_versions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."mem_well_data" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."mem_well_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."mem_wells" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."mems" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."mental_health_assessments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."moc_records" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."model_training_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."module_access" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."mud_programs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."nextgen_registrations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."offset_surveys" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."offset_wells" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."org_members" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."org_settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."organization_audit_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."organization_branding" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."organization_members" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."organization_sites" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."organization_users" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."organizations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."payment_methods" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."payments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."peer_review_audit" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."peer_review_comments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."peer_reviews" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."permissions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."petrophysics_activity_log" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."petrophysics_comments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."petrophysics_correlation_lines" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."petrophysics_curves" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."petrophysics_markers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."petrophysics_monte_carlo_runs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."petrophysics_project_versions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."petrophysics_projects" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."petrophysics_qc_reports" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."petrophysics_reserves" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."petrophysics_team_members" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."petrophysics_wells" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."pm_integrations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."predictions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."premium_subscriptions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."pressure_gradients" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."pricing_tiers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."production_data" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."production_surveillance_projects" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."project_updates" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."projects" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."property_overrides" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."pta_files" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."pta_projects" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."pta_runs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."pta_telemetry" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."purchased_modules" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."pvt_results" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."quick_report_media" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."quick_report_notifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."quick_reports" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."quickvol_api_keys" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."quickvol_generated_reports" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."quickvol_integration_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."quickvol_report_templates" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."quickvol_validation_runs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."quickvol_webhooks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."rb_cases" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "rb_cases_owner_all" ON "public"."rb_cases" TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."rb_production_data" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "rb_production_data_via_case" ON "public"."rb_production_data" TO "authenticated" USING (("case_id" IN ( SELECT "rb_cases"."id"
   FROM "public"."rb_cases"
  WHERE ("rb_cases"."user_id" = "auth"."uid"())))) WITH CHECK (("case_id" IN ( SELECT "rb_cases"."id"
   FROM "public"."rb_cases"
  WHERE ("rb_cases"."user_id" = "auth"."uid"()))));



ALTER TABLE "public"."rb_results" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "rb_results_via_case" ON "public"."rb_results" TO "authenticated" USING (("case_id" IN ( SELECT "rb_cases"."id"
   FROM "public"."rb_cases"
  WHERE ("rb_cases"."user_id" = "auth"."uid"())))) WITH CHECK (("case_id" IN ( SELECT "rb_cases"."id"
   FROM "public"."rb_cases"
  WHERE ("rb_cases"."user_id" = "auth"."uid"()))));



ALTER TABLE "public"."rb_run_configs" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "rb_run_configs_via_case" ON "public"."rb_run_configs" TO "authenticated" USING (("case_id" IN ( SELECT "rb_cases"."id"
   FROM "public"."rb_cases"
  WHERE ("rb_cases"."user_id" = "auth"."uid"())))) WITH CHECK (("case_id" IN ( SELECT "rb_cases"."id"
   FROM "public"."rb_cases"
  WHERE ("rb_cases"."user_id" = "auth"."uid"()))));



ALTER TABLE "public"."rb_runs" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "rb_runs_via_case" ON "public"."rb_runs" TO "authenticated" USING (("case_id" IN ( SELECT "rb_cases"."id"
   FROM "public"."rb_cases"
  WHERE ("rb_cases"."user_id" = "auth"."uid"())))) WITH CHECK (("case_id" IN ( SELECT "rb_cases"."id"
   FROM "public"."rb_cases"
  WHERE ("rb_cases"."user_id" = "auth"."uid"()))));



ALTER TABLE "public"."recommendations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."regulatory_authorities" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."regulatory_obligations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."renewal_audit_log" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."renewal_notifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."renewal_reminders" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."reports" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."reservoir_activities" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."reservoir_analyses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."reservoircalc_projects" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."reservoirs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."resources" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."return_to_work_plans" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."risk_kris" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."risk_mitigation_actions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."risk_register" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."risk_scenarios" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."risks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."role_permissions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."roles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."rto_connections" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."rto_settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."safety_audits" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."safety_moment_categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."safety_moments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."saved_casing_design_projects" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."saved_compressor_pump_projects" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."saved_dca_projects" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."saved_drilling_fluids_projects" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."saved_heat_exchanger_projects" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."saved_mbal_projects" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."saved_nodal_analysis_projects" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."saved_petrophysics_projects" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."saved_pipeline_sizer_projects" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."saved_pvt_projects" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."saved_quickvol_projects" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."saved_relief_projects" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."saved_report_autopilot_projects" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."saved_reservoir_balance_projects" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."saved_well_cost_iq_projects" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."saved_well_cost_projects" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "sec_mutate" ON "public"."ss_sections" USING ((EXISTS ( SELECT 1
   FROM "public"."ss_volumes" "v"
  WHERE (("v"."id" = "ss_sections"."volume_id") AND ("public"."can_edit_project"("v"."project_id") OR ("auth"."role"() = 'service_role'::"text")))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."ss_volumes" "v"
  WHERE (("v"."id" = "ss_sections"."volume_id") AND ("public"."can_edit_project"("v"."project_id") OR ("auth"."role"() = 'service_role'::"text"))))));



CREATE POLICY "sec_select" ON "public"."ss_sections" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."ss_volumes" "v"
  WHERE (("v"."id" = "ss_sections"."volume_id") AND ("public"."is_project_member"("v"."project_id") OR ("auth"."role"() = 'service_role'::"text"))))));



ALTER TABLE "public"."security_incidents" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "sens_results_insert_via_parent" ON "public"."epe_sensitivity_results" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."epe_sensitivity_runs" "r"
  WHERE (("r"."id" = "epe_sensitivity_results"."sensitivity_run_id") AND ("r"."user_id" = "auth"."uid"())))));



CREATE POLICY "sens_results_select_via_parent" ON "public"."epe_sensitivity_results" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."epe_sensitivity_runs" "r"
  WHERE (("r"."id" = "epe_sensitivity_results"."sensitivity_run_id") AND ("r"."user_id" = "auth"."uid"())))));



CREATE POLICY "sens_runs_delete_own" ON "public"."epe_sensitivity_runs" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "sens_runs_insert_own" ON "public"."epe_sensitivity_runs" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "sens_runs_select_own" ON "public"."epe_sensitivity_runs" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "sens_runs_update_own" ON "public"."epe_sensitivity_runs" FOR UPDATE USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."shared_data_registry" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sim_cases" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sim_projects" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."site_locations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."sites" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ss_assets" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ss_events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ss_interpretations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ss_jobs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ss_projects" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ss_sections" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ss_versions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ss_volumes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."stress_overrides" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."subscription_events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."subscription_usage" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."subscriptions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."super_admin_impersonation_log" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."support_ticket_comments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."support_tickets" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."surveys" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tasks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."team_app_access" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."team_members" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."teams" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tenants" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."torque_drag_runs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."trajectory_plans" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."transactions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."trend_analysis" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tubular_grades" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "update_organization_members" ON "public"."organization_members" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."organization_users" "ou"
  WHERE (("ou"."organization_id" = "organization_members"."organization_id") AND ("ou"."user_id" = "auth"."uid"()) AND ("ou"."role" = ANY (ARRAY['owner'::"text", 'admin'::"text", 'org_admin'::"text", 'super_admin'::"text"]))))));



ALTER TABLE "public"."usage_metrics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_activity_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_app_access" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_currency_preference" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_notifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_preferences" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_saved_moments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "ver_mutate" ON "public"."ss_versions" USING (("public"."can_edit_project"("project_id") OR ("auth"."role"() = 'service_role'::"text"))) WITH CHECK (("public"."can_edit_project"("project_id") OR ("auth"."role"() = 'service_role'::"text")));



CREATE POLICY "ver_select" ON "public"."ss_versions" FOR SELECT USING (("public"."is_project_member"("project_id") OR ("auth"."role"() = 'service_role'::"text")));



CREATE POLICY "view_organization_members" ON "public"."organization_members" FOR SELECT USING ((("auth"."uid"() = "user_id") OR (EXISTS ( SELECT 1
   FROM "public"."organization_users" "ou"
  WHERE (("ou"."organization_id" = "organization_members"."organization_id") AND ("ou"."user_id" = "auth"."uid"()) AND ("ou"."status" = 'active'::"text"))))));



CREATE POLICY "vol_mutate" ON "public"."ss_volumes" USING (("public"."can_edit_project"("project_id") OR ("auth"."role"() = 'service_role'::"text"))) WITH CHECK (("public"."can_edit_project"("project_id") OR ("auth"."role"() = 'service_role'::"text")));



CREATE POLICY "vol_select" ON "public"."ss_volumes" FOR SELECT USING (("public"."is_project_member"("project_id") OR ("auth"."role"() = 'service_role'::"text")));



ALTER TABLE "public"."waterflood_projects" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."well_correlation_projects" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."well_correlation_wells" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."well_targets" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."wells" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "wells_read" ON "public"."wells" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "wells_read_authenticated" ON "public"."wells" FOR SELECT TO "authenticated" USING (true);



GRANT ALL ON SCHEMA "hse" TO "authenticated";



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."add_user_to_organization"("p_user_id" "uuid", "p_org_id" "uuid", "p_role" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."add_user_to_organization"("p_user_id" "uuid", "p_org_id" "uuid", "p_role" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."add_user_to_organization"("p_user_id" "uuid", "p_org_id" "uuid", "p_role" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."block_org_members_writes"() TO "anon";
GRANT ALL ON FUNCTION "public"."block_org_members_writes"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."block_org_members_writes"() TO "service_role";



GRANT ALL ON FUNCTION "public"."block_organization_users_writes"() TO "anon";
GRANT ALL ON FUNCTION "public"."block_organization_users_writes"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."block_organization_users_writes"() TO "service_role";



GRANT ALL ON FUNCTION "public"."calculate_subscription_tier"() TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_subscription_tier"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_subscription_tier"() TO "service_role";



GRANT ALL ON FUNCTION "public"."can_edit_project"("p_project" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."can_edit_project"("p_project" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."can_edit_project"("p_project" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."can_user_access_app"("p_user_id" "uuid", "p_app_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."can_user_access_app"("p_user_id" "uuid", "p_app_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."can_user_access_app"("p_user_id" "uuid", "p_app_name" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."check_hse_access"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."check_hse_access"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_hse_access"("p_user_id" "uuid") TO "service_role";



GRANT ALL ON TABLE "public"."ss_sections" TO "anon";
GRANT ALL ON TABLE "public"."ss_sections" TO "authenticated";
GRANT ALL ON TABLE "public"."ss_sections" TO "service_role";



GRANT ALL ON FUNCTION "public"."create_ss_section"("p_volume_id" "uuid", "p_type" "public"."section_type", "p_index_int" integer, "p_path2d" "jsonb", "p_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."create_ss_section"("p_volume_id" "uuid", "p_type" "public"."section_type", "p_index_int" integer, "p_path2d" "jsonb", "p_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_ss_section"("p_volume_id" "uuid", "p_type" "public"."section_type", "p_index_int" integer, "p_path2d" "jsonb", "p_name" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."delete_organization"("org_id_to_delete" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."delete_organization"("org_id_to_delete" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_organization"("org_id_to_delete" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."enable_hse_for_organization"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."enable_hse_for_organization"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."enable_hse_for_organization"("p_user_id" "uuid") TO "service_role";



GRANT ALL ON TABLE "public"."ss_jobs" TO "anon";
GRANT ALL ON TABLE "public"."ss_jobs" TO "authenticated";
GRANT ALL ON TABLE "public"."ss_jobs" TO "service_role";



GRANT ALL ON FUNCTION "public"."enqueue_job"("p_project_id" "uuid", "p_kind" "public"."job_kind", "p_payload" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."enqueue_job"("p_project_id" "uuid", "p_kind" "public"."job_kind", "p_payload" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."enqueue_job"("p_project_id" "uuid", "p_kind" "public"."job_kind", "p_payload" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_permit_number"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_permit_number"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_permit_number"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_app_seat_usage_db"("p_organization_id" "uuid", "p_app_id" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_app_seat_usage_db"("p_organization_id" "uuid", "p_app_id" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_app_seat_usage_db"("p_organization_id" "uuid", "p_app_id" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_constraint_def"("table_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_constraint_def"("table_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_constraint_def"("table_name" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_my_claim"("claim" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_my_claim"("claim" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_my_claim"("claim" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_my_org_ids"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_my_org_ids"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_my_org_ids"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_my_organization_id"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_my_organization_id"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_my_organization_id"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_my_organization_role"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_my_organization_role"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_my_organization_role"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_subscribed_modules"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_subscribed_modules"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_subscribed_modules"("p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_users_for_organization"("org_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_users_for_organization"("org_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_users_for_organization"("org_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_hse_signup"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_hse_signup"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_hse_signup"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_super_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_super_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_super_admin"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user_profile"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user_profile"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user_profile"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_updated_at_master_apps"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_updated_at_master_apps"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_updated_at_master_apps"() TO "service_role";



GRANT ALL ON FUNCTION "public"."is_org_admin_of"("check_org_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_org_admin_of"("check_org_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_org_admin_of"("check_org_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_org_member"("org_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_org_member"("org_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_org_member"("org_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_project_member"("p_project" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_project_member"("p_project" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_project_member"("p_project" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_super_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_super_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_super_admin"() TO "service_role";



GRANT ALL ON TABLE "public"."ss_interpretations" TO "anon";
GRANT ALL ON TABLE "public"."ss_interpretations" TO "authenticated";
GRANT ALL ON TABLE "public"."ss_interpretations" TO "service_role";



GRANT ALL ON FUNCTION "public"."lock_interpretation"("p_id" "uuid", "p_lock" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."lock_interpretation"("p_id" "uuid", "p_lock" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."lock_interpretation"("p_id" "uuid", "p_lock" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."manual_verify_quote"("p_quote_id" "text", "p_organization_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."manual_verify_quote"("p_quote_id" "text", "p_organization_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."manual_verify_quote"("p_quote_id" "text", "p_organization_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."migrate_petrolord_users"() TO "anon";
GRANT ALL ON FUNCTION "public"."migrate_petrolord_users"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."migrate_petrolord_users"() TO "service_role";



GRANT ALL ON FUNCTION "public"."migrate_suite_users_to_hse"() TO "anon";
GRANT ALL ON FUNCTION "public"."migrate_suite_users_to_hse"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."migrate_suite_users_to_hse"() TO "service_role";



GRANT ALL ON FUNCTION "public"."save_interpretation"("p_id" "uuid", "p_project_id" "uuid", "p_volume_id" "uuid", "p_section_id" "uuid", "p_type" "public"."interp_type", "p_geom" "jsonb", "p_color" "text", "p_style" "jsonb", "p_source" "text", "p_version_id" "uuid", "p_stats" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."save_interpretation"("p_id" "uuid", "p_project_id" "uuid", "p_volume_id" "uuid", "p_section_id" "uuid", "p_type" "public"."interp_type", "p_geom" "jsonb", "p_color" "text", "p_style" "jsonb", "p_source" "text", "p_version_id" "uuid", "p_stats" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."save_interpretation"("p_id" "uuid", "p_project_id" "uuid", "p_volume_id" "uuid", "p_section_id" "uuid", "p_type" "public"."interp_type", "p_geom" "jsonb", "p_color" "text", "p_style" "jsonb", "p_source" "text", "p_version_id" "uuid", "p_stats" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."search_incidents"("query_embedding" "public"."vector", "similarity_threshold" double precision, "match_count" integer, "filter_incident_types" "text"[], "filter_region" "text", "filter_min_depth" integer, "filter_max_depth" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."search_incidents"("query_embedding" "public"."vector", "similarity_threshold" double precision, "match_count" integer, "filter_incident_types" "text"[], "filter_region" "text", "filter_min_depth" integer, "filter_max_depth" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."search_incidents"("query_embedding" "public"."vector", "similarity_threshold" double precision, "match_count" integer, "filter_incident_types" "text"[], "filter_region" "text", "filter_min_depth" integer, "filter_max_depth" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_last_accessed_app"("p_app_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."update_last_accessed_app"("p_app_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_last_accessed_app"("p_app_name" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_subscription_tier"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_subscription_tier"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_subscription_tier"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_usage_metrics_timestamp"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_usage_metrics_timestamp"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_usage_metrics_timestamp"() TO "service_role";



GRANT ALL ON TABLE "public"."ss_volumes" TO "anon";
GRANT ALL ON TABLE "public"."ss_volumes" TO "authenticated";
GRANT ALL ON TABLE "public"."ss_volumes" TO "service_role";



GRANT ALL ON FUNCTION "public"."upsert_ss_volume"("p_id" "uuid", "p_project_id" "uuid", "p_name" "text", "p_uri" "text", "p_format" "text", "p_srid" "text", "p_il_min" integer, "p_il_max" integer, "p_xl_min" integer, "p_xl_max" integer, "p_nsamp" integer, "p_dt_ms" numeric, "p_zunit" "text", "p_byte_order" "text", "p_stats" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."upsert_ss_volume"("p_id" "uuid", "p_project_id" "uuid", "p_name" "text", "p_uri" "text", "p_format" "text", "p_srid" "text", "p_il_min" integer, "p_il_max" integer, "p_xl_min" integer, "p_xl_max" integer, "p_nsamp" integer, "p_dt_ms" numeric, "p_zunit" "text", "p_byte_order" "text", "p_stats" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."upsert_ss_volume"("p_id" "uuid", "p_project_id" "uuid", "p_name" "text", "p_uri" "text", "p_format" "text", "p_srid" "text", "p_il_min" integer, "p_il_max" integer, "p_xl_min" integer, "p_xl_max" integer, "p_nsamp" integer, "p_dt_ms" numeric, "p_zunit" "text", "p_byte_order" "text", "p_stats" "jsonb") TO "service_role";



GRANT ALL ON TABLE "public"."absence_records" TO "anon";
GRANT ALL ON TABLE "public"."absence_records" TO "authenticated";
GRANT ALL ON TABLE "public"."absence_records" TO "service_role";



GRANT ALL ON TABLE "public"."access_audit_log" TO "anon";
GRANT ALL ON TABLE "public"."access_audit_log" TO "authenticated";
GRANT ALL ON TABLE "public"."access_audit_log" TO "service_role";



GRANT ALL ON TABLE "public"."access_credentials" TO "anon";
GRANT ALL ON TABLE "public"."access_credentials" TO "authenticated";
GRANT ALL ON TABLE "public"."access_credentials" TO "service_role";



GRANT ALL ON TABLE "public"."access_logs" TO "anon";
GRANT ALL ON TABLE "public"."access_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."access_logs" TO "service_role";



GRANT ALL ON TABLE "public"."access_requests" TO "anon";
GRANT ALL ON TABLE "public"."access_requests" TO "authenticated";
GRANT ALL ON TABLE "public"."access_requests" TO "service_role";



GRANT ALL ON TABLE "public"."actions" TO "anon";
GRANT ALL ON TABLE "public"."actions" TO "authenticated";
GRANT ALL ON TABLE "public"."actions" TO "service_role";



GRANT ALL ON TABLE "public"."master_apps" TO "anon";
GRANT ALL ON TABLE "public"."master_apps" TO "authenticated";
GRANT ALL ON TABLE "public"."master_apps" TO "service_role";



GRANT ALL ON TABLE "public"."purchased_modules" TO "anon";
GRANT ALL ON TABLE "public"."purchased_modules" TO "authenticated";
GRANT ALL ON TABLE "public"."purchased_modules" TO "service_role";



GRANT ALL ON TABLE "public"."admin_data_integrity_report" TO "anon";
GRANT ALL ON TABLE "public"."admin_data_integrity_report" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_data_integrity_report" TO "service_role";



GRANT ALL ON TABLE "public"."afe_changes" TO "anon";
GRANT ALL ON TABLE "public"."afe_changes" TO "authenticated";
GRANT ALL ON TABLE "public"."afe_changes" TO "service_role";



GRANT ALL ON TABLE "public"."afe_cost_items" TO "anon";
GRANT ALL ON TABLE "public"."afe_cost_items" TO "authenticated";
GRANT ALL ON TABLE "public"."afe_cost_items" TO "service_role";



GRANT ALL ON TABLE "public"."afe_invoices" TO "anon";
GRANT ALL ON TABLE "public"."afe_invoices" TO "authenticated";
GRANT ALL ON TABLE "public"."afe_invoices" TO "service_role";



GRANT ALL ON TABLE "public"."afes" TO "anon";
GRANT ALL ON TABLE "public"."afes" TO "authenticated";
GRANT ALL ON TABLE "public"."afes" TO "service_role";



GRANT ALL ON TABLE "public"."ai_insights" TO "anon";
GRANT ALL ON TABLE "public"."ai_insights" TO "authenticated";
GRANT ALL ON TABLE "public"."ai_insights" TO "service_role";



GRANT ALL ON TABLE "public"."alerts" TO "anon";
GRANT ALL ON TABLE "public"."alerts" TO "authenticated";
GRANT ALL ON TABLE "public"."alerts" TO "service_role";



GRANT ALL ON TABLE "public"."allocations" TO "anon";
GRANT ALL ON TABLE "public"."allocations" TO "authenticated";
GRANT ALL ON TABLE "public"."allocations" TO "service_role";



GRANT ALL ON TABLE "public"."analytics_insights" TO "anon";
GRANT ALL ON TABLE "public"."analytics_insights" TO "authenticated";
GRANT ALL ON TABLE "public"."analytics_insights" TO "service_role";



GRANT ALL ON TABLE "public"."annuli" TO "anon";
GRANT ALL ON TABLE "public"."annuli" TO "authenticated";
GRANT ALL ON TABLE "public"."annuli" TO "service_role";



GRANT ALL ON TABLE "public"."anticollision_checks" TO "anon";
GRANT ALL ON TABLE "public"."anticollision_checks" TO "authenticated";
GRANT ALL ON TABLE "public"."anticollision_checks" TO "service_role";



GRANT ALL ON TABLE "public"."api_keys" TO "anon";
GRANT ALL ON TABLE "public"."api_keys" TO "authenticated";
GRANT ALL ON TABLE "public"."api_keys" TO "service_role";



GRANT ALL ON TABLE "public"."app_activity_log" TO "anon";
GRANT ALL ON TABLE "public"."app_activity_log" TO "authenticated";
GRANT ALL ON TABLE "public"."app_activity_log" TO "service_role";



GRANT ALL ON TABLE "public"."app_analytics_daily" TO "anon";
GRANT ALL ON TABLE "public"."app_analytics_daily" TO "authenticated";
GRANT ALL ON TABLE "public"."app_analytics_daily" TO "service_role";



GRANT ALL ON TABLE "public"."app_seat_assignments" TO "anon";
GRANT ALL ON TABLE "public"."app_seat_assignments" TO "authenticated";
GRANT ALL ON TABLE "public"."app_seat_assignments" TO "service_role";



GRANT ALL ON TABLE "public"."apps" TO "anon";
GRANT ALL ON TABLE "public"."apps" TO "authenticated";
GRANT ALL ON TABLE "public"."apps" TO "service_role";



GRANT ALL ON TABLE "public"."artificial_lift_designs" TO "anon";
GRANT ALL ON TABLE "public"."artificial_lift_designs" TO "authenticated";
GRANT ALL ON TABLE "public"."artificial_lift_designs" TO "service_role";



GRANT ALL ON TABLE "public"."asset_summary" TO "anon";
GRANT ALL ON TABLE "public"."asset_summary" TO "authenticated";
GRANT ALL ON TABLE "public"."asset_summary" TO "service_role";



GRANT ALL ON TABLE "public"."audit_logs" TO "anon";
GRANT ALL ON TABLE "public"."audit_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."audit_logs" TO "service_role";



GRANT ALL ON TABLE "public"."available_modules" TO "anon";
GRANT ALL ON TABLE "public"."available_modules" TO "authenticated";
GRANT ALL ON TABLE "public"."available_modules" TO "service_role";



GRANT ALL ON TABLE "public"."badge_definitions" TO "anon";
GRANT ALL ON TABLE "public"."badge_definitions" TO "authenticated";
GRANT ALL ON TABLE "public"."badge_definitions" TO "service_role";



GRANT ALL ON TABLE "public"."behavioral_anomalies" TO "anon";
GRANT ALL ON TABLE "public"."behavioral_anomalies" TO "authenticated";
GRANT ALL ON TABLE "public"."behavioral_anomalies" TO "service_role";



GRANT ALL ON TABLE "public"."benchmarking_data" TO "anon";
GRANT ALL ON TABLE "public"."benchmarking_data" TO "authenticated";
GRANT ALL ON TABLE "public"."benchmarking_data" TO "service_role";



GRANT ALL ON TABLE "public"."bf_activity_log" TO "anon";
GRANT ALL ON TABLE "public"."bf_activity_log" TO "authenticated";
GRANT ALL ON TABLE "public"."bf_activity_log" TO "service_role";



GRANT ALL ON TABLE "public"."bf_comments" TO "anon";
GRANT ALL ON TABLE "public"."bf_comments" TO "authenticated";
GRANT ALL ON TABLE "public"."bf_comments" TO "service_role";



GRANT ALL ON TABLE "public"."bf_jobs" TO "anon";
GRANT ALL ON TABLE "public"."bf_jobs" TO "authenticated";
GRANT ALL ON TABLE "public"."bf_jobs" TO "service_role";



GRANT ALL ON TABLE "public"."bf_projects" TO "anon";
GRANT ALL ON TABLE "public"."bf_projects" TO "authenticated";
GRANT ALL ON TABLE "public"."bf_projects" TO "service_role";



GRANT ALL ON TABLE "public"."bf_team_members" TO "anon";
GRANT ALL ON TABLE "public"."bf_team_members" TO "authenticated";
GRANT ALL ON TABLE "public"."bf_team_members" TO "service_role";



GRANT ALL ON TABLE "public"."bf_versions" TO "anon";
GRANT ALL ON TABLE "public"."bf_versions" TO "authenticated";
GRANT ALL ON TABLE "public"."bf_versions" TO "service_role";



GRANT ALL ON TABLE "public"."bf_wells" TO "anon";
GRANT ALL ON TABLE "public"."bf_wells" TO "authenticated";
GRANT ALL ON TABLE "public"."bf_wells" TO "service_role";



GRANT ALL ON TABLE "public"."bhas" TO "anon";
GRANT ALL ON TABLE "public"."bhas" TO "authenticated";
GRANT ALL ON TABLE "public"."bhas" TO "service_role";



GRANT ALL ON TABLE "public"."billing_reports" TO "anon";
GRANT ALL ON TABLE "public"."billing_reports" TO "authenticated";
GRANT ALL ON TABLE "public"."billing_reports" TO "service_role";



GRANT ALL ON TABLE "public"."branding_audit_log" TO "anon";
GRANT ALL ON TABLE "public"."branding_audit_log" TO "authenticated";
GRANT ALL ON TABLE "public"."branding_audit_log" TO "service_role";



GRANT ALL ON TABLE "public"."branding_presets" TO "anon";
GRANT ALL ON TABLE "public"."branding_presets" TO "authenticated";
GRANT ALL ON TABLE "public"."branding_presets" TO "service_role";



GRANT ALL ON TABLE "public"."branding_templates" TO "anon";
GRANT ALL ON TABLE "public"."branding_templates" TO "authenticated";
GRANT ALL ON TABLE "public"."branding_templates" TO "service_role";



GRANT ALL ON TABLE "public"."bulk_import_jobs" TO "anon";
GRANT ALL ON TABLE "public"."bulk_import_jobs" TO "authenticated";
GRANT ALL ON TABLE "public"."bulk_import_jobs" TO "service_role";



GRANT ALL ON TABLE "public"."calc_runs" TO "anon";
GRANT ALL ON TABLE "public"."calc_runs" TO "authenticated";
GRANT ALL ON TABLE "public"."calc_runs" TO "service_role";



GRANT ALL ON TABLE "public"."calibration_data" TO "anon";
GRANT ALL ON TABLE "public"."calibration_data" TO "authenticated";
GRANT ALL ON TABLE "public"."calibration_data" TO "service_role";



GRANT ALL ON TABLE "public"."calibration_results" TO "anon";
GRANT ALL ON TABLE "public"."calibration_results" TO "authenticated";
GRANT ALL ON TABLE "public"."calibration_results" TO "service_role";



GRANT ALL ON TABLE "public"."casing_schemes" TO "anon";
GRANT ALL ON TABLE "public"."casing_schemes" TO "authenticated";
GRANT ALL ON TABLE "public"."casing_schemes" TO "service_role";



GRANT ALL ON TABLE "public"."casing_strings" TO "anon";
GRANT ALL ON TABLE "public"."casing_strings" TO "authenticated";
GRANT ALL ON TABLE "public"."casing_strings" TO "service_role";



GRANT ALL ON TABLE "public"."cement_jobs" TO "anon";
GRANT ALL ON TABLE "public"."cement_jobs" TO "authenticated";
GRANT ALL ON TABLE "public"."cement_jobs" TO "service_role";



GRANT ALL ON TABLE "public"."cementing_simulation_projects" TO "anon";
GRANT ALL ON TABLE "public"."cementing_simulation_projects" TO "authenticated";
GRANT ALL ON TABLE "public"."cementing_simulation_projects" TO "service_role";



GRANT ALL ON TABLE "public"."completion_plans" TO "anon";
GRANT ALL ON TABLE "public"."completion_plans" TO "authenticated";
GRANT ALL ON TABLE "public"."completion_plans" TO "service_role";



GRANT ALL ON TABLE "public"."compliance_audits" TO "anon";
GRANT ALL ON TABLE "public"."compliance_audits" TO "authenticated";
GRANT ALL ON TABLE "public"."compliance_audits" TO "service_role";



GRANT ALL ON TABLE "public"."compliance_frameworks" TO "anon";
GRANT ALL ON TABLE "public"."compliance_frameworks" TO "authenticated";
GRANT ALL ON TABLE "public"."compliance_frameworks" TO "service_role";



GRANT ALL ON TABLE "public"."compliance_requirements" TO "anon";
GRANT ALL ON TABLE "public"."compliance_requirements" TO "authenticated";
GRANT ALL ON TABLE "public"."compliance_requirements" TO "service_role";



GRANT ALL ON TABLE "public"."compliance_rules" TO "anon";
GRANT ALL ON TABLE "public"."compliance_rules" TO "authenticated";
GRANT ALL ON TABLE "public"."compliance_rules" TO "service_role";



GRANT ALL ON TABLE "public"."connectors" TO "anon";
GRANT ALL ON TABLE "public"."connectors" TO "authenticated";
GRANT ALL ON TABLE "public"."connectors" TO "service_role";



GRANT ALL ON TABLE "public"."contour_projects" TO "anon";
GRANT ALL ON TABLE "public"."contour_projects" TO "authenticated";
GRANT ALL ON TABLE "public"."contour_projects" TO "service_role";



GRANT ALL ON TABLE "public"."custom_fields" TO "anon";
GRANT ALL ON TABLE "public"."custom_fields" TO "authenticated";
GRANT ALL ON TABLE "public"."custom_fields" TO "service_role";



GRANT ALL ON TABLE "public"."custom_workflows" TO "anon";
GRANT ALL ON TABLE "public"."custom_workflows" TO "authenticated";
GRANT ALL ON TABLE "public"."custom_workflows" TO "service_role";



GRANT ALL ON TABLE "public"."data_quality_metrics" TO "anon";
GRANT ALL ON TABLE "public"."data_quality_metrics" TO "authenticated";
GRANT ALL ON TABLE "public"."data_quality_metrics" TO "service_role";



GRANT ALL ON TABLE "public"."data_uploads" TO "anon";
GRANT ALL ON TABLE "public"."data_uploads" TO "authenticated";
GRANT ALL ON TABLE "public"."data_uploads" TO "service_role";



GRANT ALL ON TABLE "public"."demo_requests" TO "anon";
GRANT ALL ON TABLE "public"."demo_requests" TO "authenticated";
GRANT ALL ON TABLE "public"."demo_requests" TO "service_role";



GRANT ALL ON TABLE "public"."departments" TO "anon";
GRANT ALL ON TABLE "public"."departments" TO "authenticated";
GRANT ALL ON TABLE "public"."departments" TO "service_role";



GRANT ALL ON TABLE "public"."discount_codes" TO "anon";
GRANT ALL ON TABLE "public"."discount_codes" TO "authenticated";
GRANT ALL ON TABLE "public"."discount_codes" TO "service_role";



GRANT ALL ON TABLE "public"."doc_activity_log" TO "anon";
GRANT ALL ON TABLE "public"."doc_activity_log" TO "authenticated";
GRANT ALL ON TABLE "public"."doc_activity_log" TO "service_role";



GRANT ALL ON TABLE "public"."doc_categories" TO "anon";
GRANT ALL ON TABLE "public"."doc_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."doc_categories" TO "service_role";



GRANT ALL ON TABLE "public"."doc_comments" TO "anon";
GRANT ALL ON TABLE "public"."doc_comments" TO "authenticated";
GRANT ALL ON TABLE "public"."doc_comments" TO "service_role";



GRANT ALL ON TABLE "public"."doc_distribution" TO "anon";
GRANT ALL ON TABLE "public"."doc_distribution" TO "authenticated";
GRANT ALL ON TABLE "public"."doc_distribution" TO "service_role";



GRANT ALL ON TABLE "public"."doc_revisions" TO "anon";
GRANT ALL ON TABLE "public"."doc_revisions" TO "authenticated";
GRANT ALL ON TABLE "public"."doc_revisions" TO "service_role";



GRANT ALL ON TABLE "public"."doc_workflows" TO "anon";
GRANT ALL ON TABLE "public"."doc_workflows" TO "authenticated";
GRANT ALL ON TABLE "public"."doc_workflows" TO "service_role";



GRANT ALL ON TABLE "public"."documents" TO "anon";
GRANT ALL ON TABLE "public"."documents" TO "authenticated";
GRANT ALL ON TABLE "public"."documents" TO "service_role";



GRANT ALL ON TABLE "public"."drilling_incidents" TO "anon";
GRANT ALL ON TABLE "public"."drilling_incidents" TO "authenticated";
GRANT ALL ON TABLE "public"."drilling_incidents" TO "service_role";



GRANT ALL ON TABLE "public"."econ_afe_budgets" TO "anon";
GRANT ALL ON TABLE "public"."econ_afe_budgets" TO "authenticated";
GRANT ALL ON TABLE "public"."econ_afe_budgets" TO "service_role";



GRANT ALL ON TABLE "public"."econ_audit_log" TO "anon";
GRANT ALL ON TABLE "public"."econ_audit_log" TO "authenticated";
GRANT ALL ON TABLE "public"."econ_audit_log" TO "service_role";



GRANT ALL ON TABLE "public"."econ_audit_logs" TO "anon";
GRANT ALL ON TABLE "public"."econ_audit_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."econ_audit_logs" TO "service_role";



GRANT ALL ON TABLE "public"."econ_fdp_snapshots" TO "anon";
GRANT ALL ON TABLE "public"."econ_fdp_snapshots" TO "authenticated";
GRANT ALL ON TABLE "public"."econ_fdp_snapshots" TO "service_role";



GRANT ALL ON TABLE "public"."econ_fiscal_terms" TO "anon";
GRANT ALL ON TABLE "public"."econ_fiscal_terms" TO "authenticated";
GRANT ALL ON TABLE "public"."econ_fiscal_terms" TO "service_role";



GRANT ALL ON TABLE "public"."econ_imports" TO "anon";
GRANT ALL ON TABLE "public"."econ_imports" TO "authenticated";
GRANT ALL ON TABLE "public"."econ_imports" TO "service_role";



GRANT ALL ON TABLE "public"."econ_inputs" TO "anon";
GRANT ALL ON TABLE "public"."econ_inputs" TO "authenticated";
GRANT ALL ON TABLE "public"."econ_inputs" TO "service_role";



GRANT ALL ON TABLE "public"."econ_line_items" TO "anon";
GRANT ALL ON TABLE "public"."econ_line_items" TO "authenticated";
GRANT ALL ON TABLE "public"."econ_line_items" TO "service_role";



GRANT ALL ON TABLE "public"."econ_metrics" TO "anon";
GRANT ALL ON TABLE "public"."econ_metrics" TO "authenticated";
GRANT ALL ON TABLE "public"."econ_metrics" TO "service_role";



GRANT ALL ON TABLE "public"."econ_models" TO "anon";
GRANT ALL ON TABLE "public"."econ_models" TO "authenticated";
GRANT ALL ON TABLE "public"."econ_models" TO "service_role";



GRANT ALL ON TABLE "public"."econ_models_v2" TO "anon";
GRANT ALL ON TABLE "public"."econ_models_v2" TO "authenticated";
GRANT ALL ON TABLE "public"."econ_models_v2" TO "service_role";



GRANT ALL ON TABLE "public"."econ_projects" TO "anon";
GRANT ALL ON TABLE "public"."econ_projects" TO "authenticated";
GRANT ALL ON TABLE "public"."econ_projects" TO "service_role";



GRANT ALL ON TABLE "public"."econ_results" TO "anon";
GRANT ALL ON TABLE "public"."econ_results" TO "authenticated";
GRANT ALL ON TABLE "public"."econ_results" TO "service_role";



GRANT ALL ON TABLE "public"."econ_scenario_notes" TO "anon";
GRANT ALL ON TABLE "public"."econ_scenario_notes" TO "authenticated";
GRANT ALL ON TABLE "public"."econ_scenario_notes" TO "service_role";



GRANT ALL ON TABLE "public"."econ_scenarios" TO "anon";
GRANT ALL ON TABLE "public"."econ_scenarios" TO "authenticated";
GRANT ALL ON TABLE "public"."econ_scenarios" TO "service_role";



GRANT ALL ON TABLE "public"."econ_scenarios_v2" TO "anon";
GRANT ALL ON TABLE "public"."econ_scenarios_v2" TO "authenticated";
GRANT ALL ON TABLE "public"."econ_scenarios_v2" TO "service_role";



GRANT ALL ON TABLE "public"."econ_sensitivity_results" TO "anon";
GRANT ALL ON TABLE "public"."econ_sensitivity_results" TO "authenticated";
GRANT ALL ON TABLE "public"."econ_sensitivity_results" TO "service_role";



GRANT ALL ON TABLE "public"."econ_timegrid" TO "anon";
GRANT ALL ON TABLE "public"."econ_timegrid" TO "authenticated";
GRANT ALL ON TABLE "public"."econ_timegrid" TO "service_role";



GRANT ALL ON TABLE "public"."em_fault_sticks" TO "anon";
GRANT ALL ON TABLE "public"."em_fault_sticks" TO "authenticated";
GRANT ALL ON TABLE "public"."em_fault_sticks" TO "service_role";



GRANT ALL ON TABLE "public"."em_faults" TO "anon";
GRANT ALL ON TABLE "public"."em_faults" TO "authenticated";
GRANT ALL ON TABLE "public"."em_faults" TO "service_role";



GRANT ALL ON TABLE "public"."em_grid_properties" TO "anon";
GRANT ALL ON TABLE "public"."em_grid_properties" TO "authenticated";
GRANT ALL ON TABLE "public"."em_grid_properties" TO "service_role";



GRANT ALL ON TABLE "public"."em_grids" TO "anon";
GRANT ALL ON TABLE "public"."em_grids" TO "authenticated";
GRANT ALL ON TABLE "public"."em_grids" TO "service_role";



GRANT ALL ON TABLE "public"."em_jobs" TO "anon";
GRANT ALL ON TABLE "public"."em_jobs" TO "authenticated";
GRANT ALL ON TABLE "public"."em_jobs" TO "service_role";



GRANT ALL ON TABLE "public"."em_object_templates" TO "anon";
GRANT ALL ON TABLE "public"."em_object_templates" TO "authenticated";
GRANT ALL ON TABLE "public"."em_object_templates" TO "service_role";



GRANT ALL ON TABLE "public"."em_objects" TO "anon";
GRANT ALL ON TABLE "public"."em_objects" TO "authenticated";
GRANT ALL ON TABLE "public"."em_objects" TO "service_role";



GRANT ALL ON TABLE "public"."em_petro_analyses" TO "anon";
GRANT ALL ON TABLE "public"."em_petro_analyses" TO "authenticated";
GRANT ALL ON TABLE "public"."em_petro_analyses" TO "service_role";



GRANT ALL ON TABLE "public"."em_petro_templates" TO "anon";
GRANT ALL ON TABLE "public"."em_petro_templates" TO "authenticated";
GRANT ALL ON TABLE "public"."em_petro_templates" TO "service_role";



GRANT ALL ON TABLE "public"."em_projects" TO "anon";
GRANT ALL ON TABLE "public"."em_projects" TO "authenticated";
GRANT ALL ON TABLE "public"."em_projects" TO "service_role";



GRANT ALL ON TABLE "public"."em_surface_points" TO "anon";
GRANT ALL ON TABLE "public"."em_surface_points" TO "authenticated";
GRANT ALL ON TABLE "public"."em_surface_points" TO "service_role";



GRANT ALL ON TABLE "public"."em_surfaces" TO "anon";
GRANT ALL ON TABLE "public"."em_surfaces" TO "authenticated";
GRANT ALL ON TABLE "public"."em_surfaces" TO "service_role";



GRANT ALL ON TABLE "public"."em_volumes" TO "anon";
GRANT ALL ON TABLE "public"."em_volumes" TO "authenticated";
GRANT ALL ON TABLE "public"."em_volumes" TO "service_role";



GRANT ALL ON TABLE "public"."em_well_logs" TO "anon";
GRANT ALL ON TABLE "public"."em_well_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."em_well_logs" TO "service_role";



GRANT ALL ON TABLE "public"."em_wells" TO "anon";
GRANT ALL ON TABLE "public"."em_wells" TO "authenticated";
GRANT ALL ON TABLE "public"."em_wells" TO "service_role";



GRANT ALL ON TABLE "public"."email_templates" TO "anon";
GRANT ALL ON TABLE "public"."email_templates" TO "authenticated";
GRANT ALL ON TABLE "public"."email_templates" TO "service_role";



GRANT ALL ON TABLE "public"."employee_app_access" TO "anon";
GRANT ALL ON TABLE "public"."employee_app_access" TO "authenticated";
GRANT ALL ON TABLE "public"."employee_app_access" TO "service_role";



GRANT ALL ON TABLE "public"."employee_storage" TO "anon";
GRANT ALL ON TABLE "public"."employee_storage" TO "authenticated";
GRANT ALL ON TABLE "public"."employee_storage" TO "service_role";



GRANT ALL ON TABLE "public"."enterprise_quotes" TO "anon";
GRANT ALL ON TABLE "public"."enterprise_quotes" TO "authenticated";
GRANT ALL ON TABLE "public"."enterprise_quotes" TO "service_role";



GRANT ALL ON TABLE "public"."environment_emp_actions" TO "anon";
GRANT ALL ON TABLE "public"."environment_emp_actions" TO "authenticated";
GRANT ALL ON TABLE "public"."environment_emp_actions" TO "service_role";



GRANT ALL ON TABLE "public"."environment_facilities" TO "anon";
GRANT ALL ON TABLE "public"."environment_facilities" TO "authenticated";
GRANT ALL ON TABLE "public"."environment_facilities" TO "service_role";



GRANT ALL ON TABLE "public"."environment_flaring_logs" TO "anon";
GRANT ALL ON TABLE "public"."environment_flaring_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."environment_flaring_logs" TO "service_role";



GRANT ALL ON TABLE "public"."environment_metrics" TO "anon";
GRANT ALL ON TABLE "public"."environment_metrics" TO "authenticated";
GRANT ALL ON TABLE "public"."environment_metrics" TO "service_role";



GRANT ALL ON TABLE "public"."environment_monitoring_results" TO "anon";
GRANT ALL ON TABLE "public"."environment_monitoring_results" TO "authenticated";
GRANT ALL ON TABLE "public"."environment_monitoring_results" TO "service_role";



GRANT ALL ON TABLE "public"."environment_obligations" TO "anon";
GRANT ALL ON TABLE "public"."environment_obligations" TO "authenticated";
GRANT ALL ON TABLE "public"."environment_obligations" TO "service_role";



GRANT ALL ON TABLE "public"."environment_permits" TO "anon";
GRANT ALL ON TABLE "public"."environment_permits" TO "authenticated";
GRANT ALL ON TABLE "public"."environment_permits" TO "service_role";



GRANT ALL ON TABLE "public"."environment_spill_reports" TO "anon";
GRANT ALL ON TABLE "public"."environment_spill_reports" TO "authenticated";
GRANT ALL ON TABLE "public"."environment_spill_reports" TO "service_role";



GRANT ALL ON TABLE "public"."environment_studies" TO "anon";
GRANT ALL ON TABLE "public"."environment_studies" TO "authenticated";
GRANT ALL ON TABLE "public"."environment_studies" TO "service_role";



GRANT ALL ON TABLE "public"."environment_waste_manifests" TO "anon";
GRANT ALL ON TABLE "public"."environment_waste_manifests" TO "authenticated";
GRANT ALL ON TABLE "public"."environment_waste_manifests" TO "service_role";



GRANT ALL ON TABLE "public"."environmental_monitoring" TO "anon";
GRANT ALL ON TABLE "public"."environmental_monitoring" TO "authenticated";
GRANT ALL ON TABLE "public"."environmental_monitoring" TO "service_role";



GRANT ALL ON TABLE "public"."epe_capex" TO "anon";
GRANT ALL ON TABLE "public"."epe_capex" TO "authenticated";
GRANT ALL ON TABLE "public"."epe_capex" TO "service_role";



GRANT ALL ON TABLE "public"."epe_cases" TO "anon";
GRANT ALL ON TABLE "public"."epe_cases" TO "authenticated";
GRANT ALL ON TABLE "public"."epe_cases" TO "service_role";



GRANT ALL ON TABLE "public"."epe_opex" TO "anon";
GRANT ALL ON TABLE "public"."epe_opex" TO "authenticated";
GRANT ALL ON TABLE "public"."epe_opex" TO "service_role";



GRANT ALL ON TABLE "public"."epe_production_volumes" TO "anon";
GRANT ALL ON TABLE "public"."epe_production_volumes" TO "authenticated";
GRANT ALL ON TABLE "public"."epe_production_volumes" TO "service_role";



GRANT ALL ON TABLE "public"."epe_results" TO "anon";
GRANT ALL ON TABLE "public"."epe_results" TO "authenticated";
GRANT ALL ON TABLE "public"."epe_results" TO "service_role";



GRANT ALL ON TABLE "public"."epe_run_configs" TO "anon";
GRANT ALL ON TABLE "public"."epe_run_configs" TO "authenticated";
GRANT ALL ON TABLE "public"."epe_run_configs" TO "service_role";



GRANT ALL ON TABLE "public"."epe_runs" TO "anon";
GRANT ALL ON TABLE "public"."epe_runs" TO "authenticated";
GRANT ALL ON TABLE "public"."epe_runs" TO "service_role";



GRANT ALL ON TABLE "public"."epe_sensitivity_results" TO "anon";
GRANT ALL ON TABLE "public"."epe_sensitivity_results" TO "authenticated";
GRANT ALL ON TABLE "public"."epe_sensitivity_results" TO "service_role";



GRANT ALL ON TABLE "public"."epe_sensitivity_runs" TO "anon";
GRANT ALL ON TABLE "public"."epe_sensitivity_runs" TO "authenticated";
GRANT ALL ON TABLE "public"."epe_sensitivity_runs" TO "service_role";



GRANT ALL ON TABLE "public"."events" TO "anon";
GRANT ALL ON TABLE "public"."events" TO "authenticated";
GRANT ALL ON TABLE "public"."events" TO "service_role";



GRANT ALL ON TABLE "public"."expert_mode_sessions" TO "anon";
GRANT ALL ON TABLE "public"."expert_mode_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."expert_mode_sessions" TO "service_role";



GRANT ALL ON TABLE "public"."expert_mode_settings" TO "anon";
GRANT ALL ON TABLE "public"."expert_mode_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."expert_mode_settings" TO "service_role";



GRANT ALL ON TABLE "public"."facility_layouts" TO "anon";
GRANT ALL ON TABLE "public"."facility_layouts" TO "authenticated";
GRANT ALL ON TABLE "public"."facility_layouts" TO "service_role";



GRANT ALL ON TABLE "public"."fdp_facilities" TO "anon";
GRANT ALL ON TABLE "public"."fdp_facilities" TO "authenticated";
GRANT ALL ON TABLE "public"."fdp_facilities" TO "service_role";



GRANT ALL ON TABLE "public"."fdp_price_decks" TO "anon";
GRANT ALL ON TABLE "public"."fdp_price_decks" TO "authenticated";
GRANT ALL ON TABLE "public"."fdp_price_decks" TO "service_role";



GRANT ALL ON TABLE "public"."fdp_projects" TO "anon";
GRANT ALL ON TABLE "public"."fdp_projects" TO "authenticated";
GRANT ALL ON TABLE "public"."fdp_projects" TO "service_role";



GRANT ALL ON TABLE "public"."fdp_wells" TO "anon";
GRANT ALL ON TABLE "public"."fdp_wells" TO "authenticated";
GRANT ALL ON TABLE "public"."fdp_wells" TO "service_role";



GRANT ALL ON TABLE "public"."feature_flags" TO "anon";
GRANT ALL ON TABLE "public"."feature_flags" TO "authenticated";
GRANT ALL ON TABLE "public"."feature_flags" TO "service_role";



GRANT ALL ON TABLE "public"."feedback" TO "anon";
GRANT ALL ON TABLE "public"."feedback" TO "authenticated";
GRANT ALL ON TABLE "public"."feedback" TO "service_role";



GRANT ALL ON TABLE "public"."fire_drills" TO "anon";
GRANT ALL ON TABLE "public"."fire_drills" TO "authenticated";
GRANT ALL ON TABLE "public"."fire_drills" TO "service_role";



GRANT ALL ON TABLE "public"."fire_emergency_response_plans" TO "anon";
GRANT ALL ON TABLE "public"."fire_emergency_response_plans" TO "authenticated";
GRANT ALL ON TABLE "public"."fire_emergency_response_plans" TO "service_role";



GRANT ALL ON TABLE "public"."fire_equipment_inventory" TO "anon";
GRANT ALL ON TABLE "public"."fire_equipment_inventory" TO "authenticated";
GRANT ALL ON TABLE "public"."fire_equipment_inventory" TO "service_role";



GRANT ALL ON TABLE "public"."fire_equipment_maintenance" TO "anon";
GRANT ALL ON TABLE "public"."fire_equipment_maintenance" TO "authenticated";
GRANT ALL ON TABLE "public"."fire_equipment_maintenance" TO "service_role";



GRANT ALL ON TABLE "public"."fire_incident_investigation" TO "anon";
GRANT ALL ON TABLE "public"."fire_incident_investigation" TO "authenticated";
GRANT ALL ON TABLE "public"."fire_incident_investigation" TO "service_role";



GRANT ALL ON TABLE "public"."fire_incidents" TO "anon";
GRANT ALL ON TABLE "public"."fire_incidents" TO "authenticated";
GRANT ALL ON TABLE "public"."fire_incidents" TO "service_role";



GRANT ALL ON TABLE "public"."fire_safety_compliance" TO "anon";
GRANT ALL ON TABLE "public"."fire_safety_compliance" TO "authenticated";
GRANT ALL ON TABLE "public"."fire_safety_compliance" TO "service_role";



GRANT ALL ON TABLE "public"."fire_safety_risks" TO "anon";
GRANT ALL ON TABLE "public"."fire_safety_risks" TO "authenticated";
GRANT ALL ON TABLE "public"."fire_safety_risks" TO "service_role";



GRANT ALL ON TABLE "public"."fiscal_regime_projects" TO "anon";
GRANT ALL ON TABLE "public"."fiscal_regime_projects" TO "authenticated";
GRANT ALL ON TABLE "public"."fiscal_regime_projects" TO "service_role";



GRANT ALL ON TABLE "public"."fitness_activities" TO "anon";
GRANT ALL ON TABLE "public"."fitness_activities" TO "authenticated";
GRANT ALL ON TABLE "public"."fitness_activities" TO "service_role";



GRANT ALL ON TABLE "public"."fitness_goals" TO "anon";
GRANT ALL ON TABLE "public"."fitness_goals" TO "authenticated";
GRANT ALL ON TABLE "public"."fitness_goals" TO "service_role";



GRANT ALL ON TABLE "public"."flow_assurance_projects" TO "anon";
GRANT ALL ON TABLE "public"."flow_assurance_projects" TO "authenticated";
GRANT ALL ON TABLE "public"."flow_assurance_projects" TO "service_role";



GRANT ALL ON TABLE "public"."fluid_studio_projects" TO "anon";
GRANT ALL ON TABLE "public"."fluid_studio_projects" TO "authenticated";
GRANT ALL ON TABLE "public"."fluid_studio_projects" TO "service_role";



GRANT ALL ON TABLE "public"."frac_completion_projects" TO "anon";
GRANT ALL ON TABLE "public"."frac_completion_projects" TO "authenticated";
GRANT ALL ON TABLE "public"."frac_completion_projects" TO "service_role";



GRANT ALL ON TABLE "public"."frac_vault" TO "anon";
GRANT ALL ON TABLE "public"."frac_vault" TO "authenticated";
GRANT ALL ON TABLE "public"."frac_vault" TO "service_role";



GRANT ALL ON TABLE "public"."geomech_measurements" TO "anon";
GRANT ALL ON TABLE "public"."geomech_measurements" TO "authenticated";
GRANT ALL ON TABLE "public"."geomech_measurements" TO "service_role";



GRANT ALL ON TABLE "public"."geomech_params" TO "anon";
GRANT ALL ON TABLE "public"."geomech_params" TO "authenticated";
GRANT ALL ON TABLE "public"."geomech_params" TO "service_role";



GRANT ALL ON TABLE "public"."geomech_velocity" TO "anon";
GRANT ALL ON TABLE "public"."geomech_velocity" TO "authenticated";
GRANT ALL ON TABLE "public"."geomech_velocity" TO "service_role";



GRANT ALL ON TABLE "public"."geomechanics_projects" TO "anon";
GRANT ALL ON TABLE "public"."geomechanics_projects" TO "authenticated";
GRANT ALL ON TABLE "public"."geomechanics_projects" TO "service_role";



GRANT ALL ON TABLE "public"."gm_curves" TO "anon";
GRANT ALL ON TABLE "public"."gm_curves" TO "authenticated";
GRANT ALL ON TABLE "public"."gm_curves" TO "service_role";



GRANT ALL ON TABLE "public"."gm_datasets" TO "anon";
GRANT ALL ON TABLE "public"."gm_datasets" TO "authenticated";
GRANT ALL ON TABLE "public"."gm_datasets" TO "service_role";



GRANT ALL ON TABLE "public"."gm_events" TO "anon";
GRANT ALL ON TABLE "public"."gm_events" TO "authenticated";
GRANT ALL ON TABLE "public"."gm_events" TO "service_role";



GRANT ALL ON TABLE "public"."gm_models" TO "anon";
GRANT ALL ON TABLE "public"."gm_models" TO "authenticated";
GRANT ALL ON TABLE "public"."gm_models" TO "service_role";



GRANT ALL ON TABLE "public"."gm_run_points" TO "anon";
GRANT ALL ON TABLE "public"."gm_run_points" TO "authenticated";
GRANT ALL ON TABLE "public"."gm_run_points" TO "service_role";



GRANT ALL ON TABLE "public"."gm_runs" TO "anon";
GRANT ALL ON TABLE "public"."gm_runs" TO "authenticated";
GRANT ALL ON TABLE "public"."gm_runs" TO "service_role";



GRANT ALL ON TABLE "public"."gm_wells" TO "anon";
GRANT ALL ON TABLE "public"."gm_wells" TO "authenticated";
GRANT ALL ON TABLE "public"."gm_wells" TO "service_role";



GRANT ALL ON TABLE "public"."hazard_assessments" TO "anon";
GRANT ALL ON TABLE "public"."hazard_assessments" TO "authenticated";
GRANT ALL ON TABLE "public"."hazard_assessments" TO "service_role";



GRANT ALL ON TABLE "public"."health_metrics" TO "anon";
GRANT ALL ON TABLE "public"."health_metrics" TO "authenticated";
GRANT ALL ON TABLE "public"."health_metrics" TO "service_role";



GRANT ALL ON TABLE "public"."health_profiles" TO "anon";
GRANT ALL ON TABLE "public"."health_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."health_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."health_screenings" TO "anon";
GRANT ALL ON TABLE "public"."health_screenings" TO "authenticated";
GRANT ALL ON TABLE "public"."health_screenings" TO "service_role";



GRANT ALL ON TABLE "public"."help_articles" TO "anon";
GRANT ALL ON TABLE "public"."help_articles" TO "authenticated";
GRANT ALL ON TABLE "public"."help_articles" TO "service_role";



GRANT ALL ON TABLE "public"."help_categories" TO "anon";
GRANT ALL ON TABLE "public"."help_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."help_categories" TO "service_role";



GRANT ALL ON TABLE "public"."help_feedback" TO "anon";
GRANT ALL ON TABLE "public"."help_feedback" TO "authenticated";
GRANT ALL ON TABLE "public"."help_feedback" TO "service_role";



GRANT ALL ON TABLE "public"."hydraulics_runs" TO "anon";
GRANT ALL ON TABLE "public"."hydraulics_runs" TO "authenticated";
GRANT ALL ON TABLE "public"."hydraulics_runs" TO "service_role";



GRANT ALL ON TABLE "public"."incident_attachments" TO "anon";
GRANT ALL ON TABLE "public"."incident_attachments" TO "authenticated";
GRANT ALL ON TABLE "public"."incident_attachments" TO "service_role";



GRANT ALL ON TABLE "public"."incident_comments" TO "anon";
GRANT ALL ON TABLE "public"."incident_comments" TO "authenticated";
GRANT ALL ON TABLE "public"."incident_comments" TO "service_role";



GRANT ALL ON TABLE "public"."incidents" TO "anon";
GRANT ALL ON TABLE "public"."incidents" TO "authenticated";
GRANT ALL ON TABLE "public"."incidents" TO "service_role";



GRANT ALL ON TABLE "public"."integration_audit_log" TO "anon";
GRANT ALL ON TABLE "public"."integration_audit_log" TO "authenticated";
GRANT ALL ON TABLE "public"."integration_audit_log" TO "service_role";



GRANT ALL ON TABLE "public"."integration_connections" TO "anon";
GRANT ALL ON TABLE "public"."integration_connections" TO "authenticated";
GRANT ALL ON TABLE "public"."integration_connections" TO "service_role";



GRANT ALL ON TABLE "public"."integration_events" TO "anon";
GRANT ALL ON TABLE "public"."integration_events" TO "authenticated";
GRANT ALL ON TABLE "public"."integration_events" TO "service_role";



GRANT ALL ON TABLE "public"."integration_logs" TO "anon";
GRANT ALL ON TABLE "public"."integration_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."integration_logs" TO "service_role";



GRANT ALL ON TABLE "public"."integration_snapshots" TO "anon";
GRANT ALL ON TABLE "public"."integration_snapshots" TO "authenticated";
GRANT ALL ON TABLE "public"."integration_snapshots" TO "service_role";



GRANT ALL ON TABLE "public"."integration_sync_history" TO "anon";
GRANT ALL ON TABLE "public"."integration_sync_history" TO "authenticated";
GRANT ALL ON TABLE "public"."integration_sync_history" TO "service_role";



GRANT ALL ON TABLE "public"."integration_workflows" TO "anon";
GRANT ALL ON TABLE "public"."integration_workflows" TO "authenticated";
GRANT ALL ON TABLE "public"."integration_workflows" TO "service_role";



GRANT ALL ON TABLE "public"."invitations" TO "anon";
GRANT ALL ON TABLE "public"."invitations" TO "authenticated";
GRANT ALL ON TABLE "public"."invitations" TO "service_role";



GRANT ALL ON TABLE "public"."invoices" TO "anon";
GRANT ALL ON TABLE "public"."invoices" TO "authenticated";
GRANT ALL ON TABLE "public"."invoices" TO "service_role";



GRANT ALL ON TABLE "public"."key_personnel" TO "anon";
GRANT ALL ON TABLE "public"."key_personnel" TO "authenticated";
GRANT ALL ON TABLE "public"."key_personnel" TO "service_role";



GRANT ALL ON TABLE "public"."leaderboard_history" TO "anon";
GRANT ALL ON TABLE "public"."leaderboard_history" TO "authenticated";
GRANT ALL ON TABLE "public"."leaderboard_history" TO "service_role";



GRANT ALL ON TABLE "public"."leaderboard_scores" TO "anon";
GRANT ALL ON TABLE "public"."leaderboard_scores" TO "authenticated";
GRANT ALL ON TABLE "public"."leaderboard_scores" TO "service_role";



GRANT ALL ON TABLE "public"."load_cases" TO "anon";
GRANT ALL ON TABLE "public"."load_cases" TO "authenticated";
GRANT ALL ON TABLE "public"."load_cases" TO "service_role";



GRANT ALL ON TABLE "public"."log_digitizer_projects" TO "anon";
GRANT ALL ON TABLE "public"."log_digitizer_projects" TO "authenticated";
GRANT ALL ON TABLE "public"."log_digitizer_projects" TO "service_role";



GRANT ALL ON TABLE "public"."log_facies_projects" TO "anon";
GRANT ALL ON TABLE "public"."log_facies_projects" TO "authenticated";
GRANT ALL ON TABLE "public"."log_facies_projects" TO "service_role";



GRANT ALL ON TABLE "public"."lookup_additives" TO "anon";
GRANT ALL ON TABLE "public"."lookup_additives" TO "authenticated";
GRANT ALL ON TABLE "public"."lookup_additives" TO "service_role";



GRANT ALL ON TABLE "public"."lookup_casing_grades" TO "anon";
GRANT ALL ON TABLE "public"."lookup_casing_grades" TO "authenticated";
GRANT ALL ON TABLE "public"."lookup_casing_grades" TO "service_role";



GRANT ALL ON TABLE "public"."medical_certifications" TO "anon";
GRANT ALL ON TABLE "public"."medical_certifications" TO "authenticated";
GRANT ALL ON TABLE "public"."medical_certifications" TO "service_role";



GRANT ALL ON TABLE "public"."mem_activity_log" TO "anon";
GRANT ALL ON TABLE "public"."mem_activity_log" TO "authenticated";
GRANT ALL ON TABLE "public"."mem_activity_log" TO "service_role";



GRANT ALL ON TABLE "public"."mem_batch_jobs" TO "anon";
GRANT ALL ON TABLE "public"."mem_batch_jobs" TO "authenticated";
GRANT ALL ON TABLE "public"."mem_batch_jobs" TO "service_role";



GRANT ALL ON TABLE "public"."mem_calculations" TO "anon";
GRANT ALL ON TABLE "public"."mem_calculations" TO "authenticated";
GRANT ALL ON TABLE "public"."mem_calculations" TO "service_role";



GRANT ALL ON TABLE "public"."mem_comments" TO "anon";
GRANT ALL ON TABLE "public"."mem_comments" TO "authenticated";
GRANT ALL ON TABLE "public"."mem_comments" TO "service_role";



GRANT ALL ON TABLE "public"."mem_edge_function_jobs" TO "anon";
GRANT ALL ON TABLE "public"."mem_edge_function_jobs" TO "authenticated";
GRANT ALL ON TABLE "public"."mem_edge_function_jobs" TO "service_role";



GRANT ALL ON TABLE "public"."mem_mechanical_properties" TO "anon";
GRANT ALL ON TABLE "public"."mem_mechanical_properties" TO "authenticated";
GRANT ALL ON TABLE "public"."mem_mechanical_properties" TO "service_role";



GRANT ALL ON TABLE "public"."mem_pressure_data" TO "anon";
GRANT ALL ON TABLE "public"."mem_pressure_data" TO "authenticated";
GRANT ALL ON TABLE "public"."mem_pressure_data" TO "service_role";



GRANT ALL ON TABLE "public"."mem_projects" TO "anon";
GRANT ALL ON TABLE "public"."mem_projects" TO "authenticated";
GRANT ALL ON TABLE "public"."mem_projects" TO "service_role";



GRANT ALL ON TABLE "public"."mem_scenarios" TO "anon";
GRANT ALL ON TABLE "public"."mem_scenarios" TO "authenticated";
GRANT ALL ON TABLE "public"."mem_scenarios" TO "service_role";



GRANT ALL ON TABLE "public"."mem_team_access" TO "anon";
GRANT ALL ON TABLE "public"."mem_team_access" TO "authenticated";
GRANT ALL ON TABLE "public"."mem_team_access" TO "service_role";



GRANT ALL ON TABLE "public"."mem_trajectories" TO "anon";
GRANT ALL ON TABLE "public"."mem_trajectories" TO "authenticated";
GRANT ALL ON TABLE "public"."mem_trajectories" TO "service_role";



GRANT ALL ON TABLE "public"."mem_versions" TO "anon";
GRANT ALL ON TABLE "public"."mem_versions" TO "authenticated";
GRANT ALL ON TABLE "public"."mem_versions" TO "service_role";



GRANT ALL ON TABLE "public"."mem_well_data" TO "anon";
GRANT ALL ON TABLE "public"."mem_well_data" TO "authenticated";
GRANT ALL ON TABLE "public"."mem_well_data" TO "service_role";



GRANT ALL ON TABLE "public"."mem_well_logs" TO "anon";
GRANT ALL ON TABLE "public"."mem_well_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."mem_well_logs" TO "service_role";



GRANT ALL ON TABLE "public"."mem_wells" TO "anon";
GRANT ALL ON TABLE "public"."mem_wells" TO "authenticated";
GRANT ALL ON TABLE "public"."mem_wells" TO "service_role";



GRANT ALL ON TABLE "public"."mems" TO "anon";
GRANT ALL ON TABLE "public"."mems" TO "authenticated";
GRANT ALL ON TABLE "public"."mems" TO "service_role";



GRANT ALL ON TABLE "public"."mental_health_assessments" TO "anon";
GRANT ALL ON TABLE "public"."mental_health_assessments" TO "authenticated";
GRANT ALL ON TABLE "public"."mental_health_assessments" TO "service_role";



GRANT ALL ON TABLE "public"."moc_actions" TO "anon";
GRANT ALL ON TABLE "public"."moc_actions" TO "authenticated";
GRANT ALL ON TABLE "public"."moc_actions" TO "service_role";



GRANT ALL ON TABLE "public"."moc_activity_log" TO "anon";
GRANT ALL ON TABLE "public"."moc_activity_log" TO "authenticated";
GRANT ALL ON TABLE "public"."moc_activity_log" TO "service_role";



GRANT ALL ON TABLE "public"."moc_approvals" TO "anon";
GRANT ALL ON TABLE "public"."moc_approvals" TO "authenticated";
GRANT ALL ON TABLE "public"."moc_approvals" TO "service_role";



GRANT ALL ON TABLE "public"."moc_comments" TO "anon";
GRANT ALL ON TABLE "public"."moc_comments" TO "authenticated";
GRANT ALL ON TABLE "public"."moc_comments" TO "service_role";



GRANT ALL ON TABLE "public"."moc_impacts" TO "anon";
GRANT ALL ON TABLE "public"."moc_impacts" TO "authenticated";
GRANT ALL ON TABLE "public"."moc_impacts" TO "service_role";



GRANT ALL ON TABLE "public"."moc_records" TO "anon";
GRANT ALL ON TABLE "public"."moc_records" TO "authenticated";
GRANT ALL ON TABLE "public"."moc_records" TO "service_role";



GRANT ALL ON TABLE "public"."moc_reviews" TO "anon";
GRANT ALL ON TABLE "public"."moc_reviews" TO "authenticated";
GRANT ALL ON TABLE "public"."moc_reviews" TO "service_role";



GRANT ALL ON TABLE "public"."model_training_logs" TO "anon";
GRANT ALL ON TABLE "public"."model_training_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."model_training_logs" TO "service_role";



GRANT ALL ON TABLE "public"."model_versions" TO "anon";
GRANT ALL ON TABLE "public"."model_versions" TO "authenticated";
GRANT ALL ON TABLE "public"."model_versions" TO "service_role";



GRANT ALL ON TABLE "public"."module_access" TO "anon";
GRANT ALL ON TABLE "public"."module_access" TO "authenticated";
GRANT ALL ON TABLE "public"."module_access" TO "service_role";



GRANT ALL ON TABLE "public"."modules" TO "anon";
GRANT ALL ON TABLE "public"."modules" TO "authenticated";
GRANT ALL ON TABLE "public"."modules" TO "service_role";



GRANT ALL ON TABLE "public"."mud_programs" TO "anon";
GRANT ALL ON TABLE "public"."mud_programs" TO "authenticated";
GRANT ALL ON TABLE "public"."mud_programs" TO "service_role";



GRANT ALL ON TABLE "public"."nextgen_registrations" TO "anon";
GRANT ALL ON TABLE "public"."nextgen_registrations" TO "authenticated";
GRANT ALL ON TABLE "public"."nextgen_registrations" TO "service_role";



GRANT ALL ON TABLE "public"."offset_surveys" TO "anon";
GRANT ALL ON TABLE "public"."offset_surveys" TO "authenticated";
GRANT ALL ON TABLE "public"."offset_surveys" TO "service_role";



GRANT ALL ON TABLE "public"."offset_wells" TO "anon";
GRANT ALL ON TABLE "public"."offset_wells" TO "authenticated";
GRANT ALL ON TABLE "public"."offset_wells" TO "service_role";



GRANT ALL ON TABLE "public"."org_members" TO "anon";
GRANT ALL ON TABLE "public"."org_members" TO "authenticated";
GRANT ALL ON TABLE "public"."org_members" TO "service_role";



GRANT ALL ON TABLE "public"."org_settings" TO "anon";
GRANT ALL ON TABLE "public"."org_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."org_settings" TO "service_role";



GRANT ALL ON TABLE "public"."organization_apps" TO "anon";
GRANT ALL ON TABLE "public"."organization_apps" TO "authenticated";
GRANT ALL ON TABLE "public"."organization_apps" TO "service_role";



GRANT ALL ON TABLE "public"."organization_assets" TO "anon";
GRANT ALL ON TABLE "public"."organization_assets" TO "authenticated";
GRANT ALL ON TABLE "public"."organization_assets" TO "service_role";



GRANT ALL ON TABLE "public"."organization_audit_logs" TO "anon";
GRANT ALL ON TABLE "public"."organization_audit_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."organization_audit_logs" TO "service_role";



GRANT ALL ON TABLE "public"."organization_branding" TO "anon";
GRANT ALL ON TABLE "public"."organization_branding" TO "authenticated";
GRANT ALL ON TABLE "public"."organization_branding" TO "service_role";



GRANT ALL ON TABLE "public"."organization_members" TO "anon";
GRANT ALL ON TABLE "public"."organization_members" TO "authenticated";
GRANT ALL ON TABLE "public"."organization_members" TO "service_role";



GRANT ALL ON TABLE "public"."organization_sites" TO "anon";
GRANT ALL ON TABLE "public"."organization_sites" TO "authenticated";
GRANT ALL ON TABLE "public"."organization_sites" TO "service_role";



GRANT ALL ON TABLE "public"."organization_users" TO "anon";
GRANT ALL ON TABLE "public"."organization_users" TO "authenticated";
GRANT ALL ON TABLE "public"."organization_users" TO "service_role";



GRANT ALL ON TABLE "public"."organizations" TO "anon";
GRANT ALL ON TABLE "public"."organizations" TO "authenticated";
GRANT ALL ON TABLE "public"."organizations" TO "service_role";



GRANT ALL ON TABLE "public"."payment_audit_log" TO "anon";
GRANT ALL ON TABLE "public"."payment_audit_log" TO "authenticated";
GRANT ALL ON TABLE "public"."payment_audit_log" TO "service_role";



GRANT ALL ON TABLE "public"."payment_methods" TO "anon";
GRANT ALL ON TABLE "public"."payment_methods" TO "authenticated";
GRANT ALL ON TABLE "public"."payment_methods" TO "service_role";



GRANT ALL ON TABLE "public"."payment_notifications" TO "anon";
GRANT ALL ON TABLE "public"."payment_notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."payment_notifications" TO "service_role";



GRANT ALL ON TABLE "public"."payments" TO "anon";
GRANT ALL ON TABLE "public"."payments" TO "authenticated";
GRANT ALL ON TABLE "public"."payments" TO "service_role";



GRANT ALL ON TABLE "public"."peer_review_audit" TO "anon";
GRANT ALL ON TABLE "public"."peer_review_audit" TO "authenticated";
GRANT ALL ON TABLE "public"."peer_review_audit" TO "service_role";



GRANT ALL ON TABLE "public"."peer_review_comments" TO "anon";
GRANT ALL ON TABLE "public"."peer_review_comments" TO "authenticated";
GRANT ALL ON TABLE "public"."peer_review_comments" TO "service_role";



GRANT ALL ON TABLE "public"."peer_reviews" TO "anon";
GRANT ALL ON TABLE "public"."peer_reviews" TO "authenticated";
GRANT ALL ON TABLE "public"."peer_reviews" TO "service_role";



GRANT ALL ON TABLE "public"."permissions" TO "anon";
GRANT ALL ON TABLE "public"."permissions" TO "authenticated";
GRANT ALL ON TABLE "public"."permissions" TO "service_role";



GRANT ALL ON TABLE "public"."permit_approvals" TO "anon";
GRANT ALL ON TABLE "public"."permit_approvals" TO "authenticated";
GRANT ALL ON TABLE "public"."permit_approvals" TO "service_role";



GRANT ALL ON TABLE "public"."permit_templates" TO "anon";
GRANT ALL ON TABLE "public"."permit_templates" TO "authenticated";
GRANT ALL ON TABLE "public"."permit_templates" TO "service_role";



GRANT ALL ON TABLE "public"."petrophysics_activity_log" TO "anon";
GRANT ALL ON TABLE "public"."petrophysics_activity_log" TO "authenticated";
GRANT ALL ON TABLE "public"."petrophysics_activity_log" TO "service_role";



GRANT ALL ON TABLE "public"."petrophysics_channels" TO "anon";
GRANT ALL ON TABLE "public"."petrophysics_channels" TO "authenticated";
GRANT ALL ON TABLE "public"."petrophysics_channels" TO "service_role";



GRANT ALL ON TABLE "public"."petrophysics_comments" TO "anon";
GRANT ALL ON TABLE "public"."petrophysics_comments" TO "authenticated";
GRANT ALL ON TABLE "public"."petrophysics_comments" TO "service_role";



GRANT ALL ON TABLE "public"."petrophysics_correlation_lines" TO "anon";
GRANT ALL ON TABLE "public"."petrophysics_correlation_lines" TO "authenticated";
GRANT ALL ON TABLE "public"."petrophysics_correlation_lines" TO "service_role";



GRANT ALL ON TABLE "public"."petrophysics_curves" TO "anon";
GRANT ALL ON TABLE "public"."petrophysics_curves" TO "authenticated";
GRANT ALL ON TABLE "public"."petrophysics_curves" TO "service_role";



GRANT ALL ON TABLE "public"."petrophysics_markers" TO "anon";
GRANT ALL ON TABLE "public"."petrophysics_markers" TO "authenticated";
GRANT ALL ON TABLE "public"."petrophysics_markers" TO "service_role";



GRANT ALL ON TABLE "public"."petrophysics_messages" TO "anon";
GRANT ALL ON TABLE "public"."petrophysics_messages" TO "authenticated";
GRANT ALL ON TABLE "public"."petrophysics_messages" TO "service_role";



GRANT ALL ON TABLE "public"."petrophysics_monte_carlo_runs" TO "anon";
GRANT ALL ON TABLE "public"."petrophysics_monte_carlo_runs" TO "authenticated";
GRANT ALL ON TABLE "public"."petrophysics_monte_carlo_runs" TO "service_role";



GRANT ALL ON TABLE "public"."petrophysics_notifications" TO "anon";
GRANT ALL ON TABLE "public"."petrophysics_notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."petrophysics_notifications" TO "service_role";



GRANT ALL ON TABLE "public"."petrophysics_project_versions" TO "anon";
GRANT ALL ON TABLE "public"."petrophysics_project_versions" TO "authenticated";
GRANT ALL ON TABLE "public"."petrophysics_project_versions" TO "service_role";



GRANT ALL ON TABLE "public"."petrophysics_projects" TO "anon";
GRANT ALL ON TABLE "public"."petrophysics_projects" TO "authenticated";
GRANT ALL ON TABLE "public"."petrophysics_projects" TO "service_role";



GRANT ALL ON TABLE "public"."petrophysics_qc_reports" TO "anon";
GRANT ALL ON TABLE "public"."petrophysics_qc_reports" TO "authenticated";
GRANT ALL ON TABLE "public"."petrophysics_qc_reports" TO "service_role";



GRANT ALL ON TABLE "public"."petrophysics_reserves" TO "anon";
GRANT ALL ON TABLE "public"."petrophysics_reserves" TO "authenticated";
GRANT ALL ON TABLE "public"."petrophysics_reserves" TO "service_role";



GRANT ALL ON TABLE "public"."petrophysics_team_members" TO "anon";
GRANT ALL ON TABLE "public"."petrophysics_team_members" TO "authenticated";
GRANT ALL ON TABLE "public"."petrophysics_team_members" TO "service_role";



GRANT ALL ON TABLE "public"."petrophysics_wells" TO "anon";
GRANT ALL ON TABLE "public"."petrophysics_wells" TO "authenticated";
GRANT ALL ON TABLE "public"."petrophysics_wells" TO "service_role";



GRANT ALL ON TABLE "public"."petrophysics_wiki_pages" TO "anon";
GRANT ALL ON TABLE "public"."petrophysics_wiki_pages" TO "authenticated";
GRANT ALL ON TABLE "public"."petrophysics_wiki_pages" TO "service_role";



GRANT ALL ON TABLE "public"."phishing_results" TO "anon";
GRANT ALL ON TABLE "public"."phishing_results" TO "authenticated";
GRANT ALL ON TABLE "public"."phishing_results" TO "service_role";



GRANT ALL ON TABLE "public"."phishing_simulations" TO "anon";
GRANT ALL ON TABLE "public"."phishing_simulations" TO "authenticated";
GRANT ALL ON TABLE "public"."phishing_simulations" TO "service_role";



GRANT ALL ON TABLE "public"."pm_app_integrations" TO "anon";
GRANT ALL ON TABLE "public"."pm_app_integrations" TO "authenticated";
GRANT ALL ON TABLE "public"."pm_app_integrations" TO "service_role";



GRANT ALL ON TABLE "public"."pm_deliverables" TO "anon";
GRANT ALL ON TABLE "public"."pm_deliverables" TO "authenticated";
GRANT ALL ON TABLE "public"."pm_deliverables" TO "service_role";



GRANT ALL ON TABLE "public"."pm_integration_logs" TO "anon";
GRANT ALL ON TABLE "public"."pm_integration_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."pm_integration_logs" TO "service_role";



GRANT ALL ON TABLE "public"."pm_integrations" TO "anon";
GRANT ALL ON TABLE "public"."pm_integrations" TO "authenticated";
GRANT ALL ON TABLE "public"."pm_integrations" TO "service_role";



GRANT ALL ON TABLE "public"."pm_resource_assignments" TO "anon";
GRANT ALL ON TABLE "public"."pm_resource_assignments" TO "authenticated";
GRANT ALL ON TABLE "public"."pm_resource_assignments" TO "service_role";



GRANT ALL ON TABLE "public"."pm_resources" TO "anon";
GRANT ALL ON TABLE "public"."pm_resources" TO "authenticated";
GRANT ALL ON TABLE "public"."pm_resources" TO "service_role";



GRANT ALL ON TABLE "public"."portfolio_projects" TO "anon";
GRANT ALL ON TABLE "public"."portfolio_projects" TO "authenticated";
GRANT ALL ON TABLE "public"."portfolio_projects" TO "service_role";



GRANT ALL ON TABLE "public"."portfolio_scenario_projects" TO "anon";
GRANT ALL ON TABLE "public"."portfolio_scenario_projects" TO "authenticated";
GRANT ALL ON TABLE "public"."portfolio_scenario_projects" TO "service_role";



GRANT ALL ON TABLE "public"."portfolio_snapshots" TO "anon";
GRANT ALL ON TABLE "public"."portfolio_snapshots" TO "authenticated";
GRANT ALL ON TABLE "public"."portfolio_snapshots" TO "service_role";



GRANT ALL ON TABLE "public"."portfolios" TO "anon";
GRANT ALL ON TABLE "public"."portfolios" TO "authenticated";
GRANT ALL ON TABLE "public"."portfolios" TO "service_role";



GRANT ALL ON TABLE "public"."positions" TO "anon";
GRANT ALL ON TABLE "public"."positions" TO "authenticated";
GRANT ALL ON TABLE "public"."positions" TO "service_role";



GRANT ALL ON TABLE "public"."predictions" TO "anon";
GRANT ALL ON TABLE "public"."predictions" TO "authenticated";
GRANT ALL ON TABLE "public"."predictions" TO "service_role";



GRANT ALL ON TABLE "public"."premium_subscriptions" TO "anon";
GRANT ALL ON TABLE "public"."premium_subscriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."premium_subscriptions" TO "service_role";



GRANT ALL ON TABLE "public"."pressure_gradients" TO "anon";
GRANT ALL ON TABLE "public"."pressure_gradients" TO "authenticated";
GRANT ALL ON TABLE "public"."pressure_gradients" TO "service_role";



GRANT ALL ON TABLE "public"."pricing_config" TO "anon";
GRANT ALL ON TABLE "public"."pricing_config" TO "authenticated";
GRANT ALL ON TABLE "public"."pricing_config" TO "service_role";



GRANT ALL ON TABLE "public"."pricing_tiers" TO "anon";
GRANT ALL ON TABLE "public"."pricing_tiers" TO "authenticated";
GRANT ALL ON TABLE "public"."pricing_tiers" TO "service_role";



GRANT ALL ON TABLE "public"."production_data" TO "anon";
GRANT ALL ON TABLE "public"."production_data" TO "authenticated";
GRANT ALL ON TABLE "public"."production_data" TO "service_role";



GRANT ALL ON TABLE "public"."production_surveillance_projects" TO "anon";
GRANT ALL ON TABLE "public"."production_surveillance_projects" TO "authenticated";
GRANT ALL ON TABLE "public"."production_surveillance_projects" TO "service_role";



GRANT ALL ON TABLE "public"."project_issues" TO "anon";
GRANT ALL ON TABLE "public"."project_issues" TO "authenticated";
GRANT ALL ON TABLE "public"."project_issues" TO "service_role";



GRANT ALL ON TABLE "public"."project_members" TO "anon";
GRANT ALL ON TABLE "public"."project_members" TO "authenticated";
GRANT ALL ON TABLE "public"."project_members" TO "service_role";



GRANT ALL ON TABLE "public"."project_updates" TO "anon";
GRANT ALL ON TABLE "public"."project_updates" TO "authenticated";
GRANT ALL ON TABLE "public"."project_updates" TO "service_role";



GRANT ALL ON TABLE "public"."projects" TO "anon";
GRANT ALL ON TABLE "public"."projects" TO "authenticated";
GRANT ALL ON TABLE "public"."projects" TO "service_role";



GRANT ALL ON TABLE "public"."property_overrides" TO "anon";
GRANT ALL ON TABLE "public"."property_overrides" TO "authenticated";
GRANT ALL ON TABLE "public"."property_overrides" TO "service_role";



GRANT ALL ON TABLE "public"."pta_files" TO "anon";
GRANT ALL ON TABLE "public"."pta_files" TO "authenticated";
GRANT ALL ON TABLE "public"."pta_files" TO "service_role";



GRANT ALL ON TABLE "public"."pta_projects" TO "anon";
GRANT ALL ON TABLE "public"."pta_projects" TO "authenticated";
GRANT ALL ON TABLE "public"."pta_projects" TO "service_role";



GRANT ALL ON TABLE "public"."pta_runs" TO "anon";
GRANT ALL ON TABLE "public"."pta_runs" TO "authenticated";
GRANT ALL ON TABLE "public"."pta_runs" TO "service_role";



GRANT ALL ON TABLE "public"."pta_telemetry" TO "anon";
GRANT ALL ON TABLE "public"."pta_telemetry" TO "authenticated";
GRANT ALL ON TABLE "public"."pta_telemetry" TO "service_role";



GRANT ALL ON TABLE "public"."public_qr_sites" TO "anon";
GRANT ALL ON TABLE "public"."public_qr_sites" TO "authenticated";
GRANT ALL ON TABLE "public"."public_qr_sites" TO "service_role";



GRANT ALL ON TABLE "public"."purchased_apps" TO "anon";
GRANT ALL ON TABLE "public"."purchased_apps" TO "authenticated";
GRANT ALL ON TABLE "public"."purchased_apps" TO "service_role";



GRANT ALL ON TABLE "public"."pvt_results" TO "anon";
GRANT ALL ON TABLE "public"."pvt_results" TO "authenticated";
GRANT ALL ON TABLE "public"."pvt_results" TO "service_role";



GRANT ALL ON SEQUENCE "public"."pvt_results_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."pvt_results_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."pvt_results_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."quick_report_media" TO "anon";
GRANT ALL ON TABLE "public"."quick_report_media" TO "authenticated";
GRANT ALL ON TABLE "public"."quick_report_media" TO "service_role";



GRANT ALL ON TABLE "public"."quick_report_notifications" TO "anon";
GRANT ALL ON TABLE "public"."quick_report_notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."quick_report_notifications" TO "service_role";



GRANT ALL ON TABLE "public"."quick_reports" TO "anon";
GRANT ALL ON TABLE "public"."quick_reports" TO "authenticated";
GRANT ALL ON TABLE "public"."quick_reports" TO "service_role";



GRANT ALL ON TABLE "public"."quickvol_activity_logs" TO "anon";
GRANT ALL ON TABLE "public"."quickvol_activity_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."quickvol_activity_logs" TO "service_role";



GRANT ALL ON TABLE "public"."quickvol_api_keys" TO "anon";
GRANT ALL ON TABLE "public"."quickvol_api_keys" TO "authenticated";
GRANT ALL ON TABLE "public"."quickvol_api_keys" TO "service_role";



GRANT ALL ON TABLE "public"."quickvol_comments" TO "anon";
GRANT ALL ON TABLE "public"."quickvol_comments" TO "authenticated";
GRANT ALL ON TABLE "public"."quickvol_comments" TO "service_role";



GRANT ALL ON TABLE "public"."quickvol_generated_reports" TO "anon";
GRANT ALL ON TABLE "public"."quickvol_generated_reports" TO "authenticated";
GRANT ALL ON TABLE "public"."quickvol_generated_reports" TO "service_role";



GRANT ALL ON TABLE "public"."quickvol_integration_logs" TO "anon";
GRANT ALL ON TABLE "public"."quickvol_integration_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."quickvol_integration_logs" TO "service_role";



GRANT ALL ON TABLE "public"."quickvol_ml_models" TO "anon";
GRANT ALL ON TABLE "public"."quickvol_ml_models" TO "authenticated";
GRANT ALL ON TABLE "public"."quickvol_ml_models" TO "service_role";



GRANT ALL ON TABLE "public"."quickvol_predictions" TO "anon";
GRANT ALL ON TABLE "public"."quickvol_predictions" TO "authenticated";
GRANT ALL ON TABLE "public"."quickvol_predictions" TO "service_role";



GRANT ALL ON TABLE "public"."quickvol_report_templates" TO "anon";
GRANT ALL ON TABLE "public"."quickvol_report_templates" TO "authenticated";
GRANT ALL ON TABLE "public"."quickvol_report_templates" TO "service_role";



GRANT ALL ON TABLE "public"."quickvol_validation_runs" TO "anon";
GRANT ALL ON TABLE "public"."quickvol_validation_runs" TO "authenticated";
GRANT ALL ON TABLE "public"."quickvol_validation_runs" TO "service_role";



GRANT ALL ON TABLE "public"."quickvol_versions" TO "anon";
GRANT ALL ON TABLE "public"."quickvol_versions" TO "authenticated";
GRANT ALL ON TABLE "public"."quickvol_versions" TO "service_role";



GRANT ALL ON TABLE "public"."quickvol_webhooks" TO "anon";
GRANT ALL ON TABLE "public"."quickvol_webhooks" TO "authenticated";
GRANT ALL ON TABLE "public"."quickvol_webhooks" TO "service_role";



GRANT ALL ON TABLE "public"."quickvol_workspace_members" TO "anon";
GRANT ALL ON TABLE "public"."quickvol_workspace_members" TO "authenticated";
GRANT ALL ON TABLE "public"."quickvol_workspace_members" TO "service_role";



GRANT ALL ON TABLE "public"."quickvol_workspaces" TO "anon";
GRANT ALL ON TABLE "public"."quickvol_workspaces" TO "authenticated";
GRANT ALL ON TABLE "public"."quickvol_workspaces" TO "service_role";



GRANT ALL ON TABLE "public"."quotes" TO "anon";
GRANT ALL ON TABLE "public"."quotes" TO "authenticated";
GRANT ALL ON TABLE "public"."quotes" TO "service_role";



GRANT ALL ON TABLE "public"."rb_cases" TO "anon";
GRANT ALL ON TABLE "public"."rb_cases" TO "authenticated";
GRANT ALL ON TABLE "public"."rb_cases" TO "service_role";



GRANT ALL ON TABLE "public"."rb_production_data" TO "anon";
GRANT ALL ON TABLE "public"."rb_production_data" TO "authenticated";
GRANT ALL ON TABLE "public"."rb_production_data" TO "service_role";



GRANT ALL ON TABLE "public"."rb_results" TO "anon";
GRANT ALL ON TABLE "public"."rb_results" TO "authenticated";
GRANT ALL ON TABLE "public"."rb_results" TO "service_role";



GRANT ALL ON TABLE "public"."rb_run_configs" TO "anon";
GRANT ALL ON TABLE "public"."rb_run_configs" TO "authenticated";
GRANT ALL ON TABLE "public"."rb_run_configs" TO "service_role";



GRANT ALL ON TABLE "public"."rb_runs" TO "anon";
GRANT ALL ON TABLE "public"."rb_runs" TO "authenticated";
GRANT ALL ON TABLE "public"."rb_runs" TO "service_role";



GRANT ALL ON TABLE "public"."recommendations" TO "anon";
GRANT ALL ON TABLE "public"."recommendations" TO "authenticated";
GRANT ALL ON TABLE "public"."recommendations" TO "service_role";



GRANT ALL ON TABLE "public"."regulatory_authorities" TO "anon";
GRANT ALL ON TABLE "public"."regulatory_authorities" TO "authenticated";
GRANT ALL ON TABLE "public"."regulatory_authorities" TO "service_role";



GRANT ALL ON TABLE "public"."regulatory_obligations" TO "anon";
GRANT ALL ON TABLE "public"."regulatory_obligations" TO "authenticated";
GRANT ALL ON TABLE "public"."regulatory_obligations" TO "service_role";



GRANT ALL ON TABLE "public"."renewal_audit_log" TO "anon";
GRANT ALL ON TABLE "public"."renewal_audit_log" TO "authenticated";
GRANT ALL ON TABLE "public"."renewal_audit_log" TO "service_role";



GRANT ALL ON TABLE "public"."renewal_notifications" TO "anon";
GRANT ALL ON TABLE "public"."renewal_notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."renewal_notifications" TO "service_role";



GRANT ALL ON TABLE "public"."renewal_reminders" TO "anon";
GRANT ALL ON TABLE "public"."renewal_reminders" TO "authenticated";
GRANT ALL ON TABLE "public"."renewal_reminders" TO "service_role";



GRANT ALL ON TABLE "public"."report_shares" TO "anon";
GRANT ALL ON TABLE "public"."report_shares" TO "authenticated";
GRANT ALL ON TABLE "public"."report_shares" TO "service_role";



GRANT ALL ON TABLE "public"."reports" TO "anon";
GRANT ALL ON TABLE "public"."reports" TO "authenticated";
GRANT ALL ON TABLE "public"."reports" TO "service_role";



GRANT ALL ON TABLE "public"."reservoir_activities" TO "anon";
GRANT ALL ON TABLE "public"."reservoir_activities" TO "authenticated";
GRANT ALL ON TABLE "public"."reservoir_activities" TO "service_role";



GRANT ALL ON TABLE "public"."reservoir_analyses" TO "anon";
GRANT ALL ON TABLE "public"."reservoir_analyses" TO "authenticated";
GRANT ALL ON TABLE "public"."reservoir_analyses" TO "service_role";



GRANT ALL ON TABLE "public"."reservoircalc_projects" TO "anon";
GRANT ALL ON TABLE "public"."reservoircalc_projects" TO "authenticated";
GRANT ALL ON TABLE "public"."reservoircalc_projects" TO "service_role";



GRANT ALL ON TABLE "public"."reservoirs" TO "anon";
GRANT ALL ON TABLE "public"."reservoirs" TO "authenticated";
GRANT ALL ON TABLE "public"."reservoirs" TO "service_role";



GRANT ALL ON TABLE "public"."resources" TO "anon";
GRANT ALL ON TABLE "public"."resources" TO "authenticated";
GRANT ALL ON TABLE "public"."resources" TO "service_role";



GRANT ALL ON TABLE "public"."retraining_jobs" TO "anon";
GRANT ALL ON TABLE "public"."retraining_jobs" TO "authenticated";
GRANT ALL ON TABLE "public"."retraining_jobs" TO "service_role";



GRANT ALL ON TABLE "public"."return_to_work_plans" TO "anon";
GRANT ALL ON TABLE "public"."return_to_work_plans" TO "authenticated";
GRANT ALL ON TABLE "public"."return_to_work_plans" TO "service_role";



GRANT ALL ON TABLE "public"."risk_actions" TO "anon";
GRANT ALL ON TABLE "public"."risk_actions" TO "authenticated";
GRANT ALL ON TABLE "public"."risk_actions" TO "service_role";



GRANT ALL ON TABLE "public"."risk_activity_log" TO "anon";
GRANT ALL ON TABLE "public"."risk_activity_log" TO "authenticated";
GRANT ALL ON TABLE "public"."risk_activity_log" TO "service_role";



GRANT ALL ON TABLE "public"."risk_attachments" TO "anon";
GRANT ALL ON TABLE "public"."risk_attachments" TO "authenticated";
GRANT ALL ON TABLE "public"."risk_attachments" TO "service_role";



GRANT ALL ON TABLE "public"."risk_comments" TO "anon";
GRANT ALL ON TABLE "public"."risk_comments" TO "authenticated";
GRANT ALL ON TABLE "public"."risk_comments" TO "service_role";



GRANT ALL ON TABLE "public"."risk_kris" TO "anon";
GRANT ALL ON TABLE "public"."risk_kris" TO "authenticated";
GRANT ALL ON TABLE "public"."risk_kris" TO "service_role";



GRANT ALL ON TABLE "public"."risk_links" TO "anon";
GRANT ALL ON TABLE "public"."risk_links" TO "authenticated";
GRANT ALL ON TABLE "public"."risk_links" TO "service_role";



GRANT ALL ON TABLE "public"."risk_mitigation_actions" TO "anon";
GRANT ALL ON TABLE "public"."risk_mitigation_actions" TO "authenticated";
GRANT ALL ON TABLE "public"."risk_mitigation_actions" TO "service_role";



GRANT ALL ON TABLE "public"."risk_register" TO "anon";
GRANT ALL ON TABLE "public"."risk_register" TO "authenticated";
GRANT ALL ON TABLE "public"."risk_register" TO "service_role";



GRANT ALL ON TABLE "public"."risk_register_snapshots" TO "anon";
GRANT ALL ON TABLE "public"."risk_register_snapshots" TO "authenticated";
GRANT ALL ON TABLE "public"."risk_register_snapshots" TO "service_role";



GRANT ALL ON TABLE "public"."risk_reviews" TO "anon";
GRANT ALL ON TABLE "public"."risk_reviews" TO "authenticated";
GRANT ALL ON TABLE "public"."risk_reviews" TO "service_role";



GRANT ALL ON TABLE "public"."risk_scenarios" TO "anon";
GRANT ALL ON TABLE "public"."risk_scenarios" TO "authenticated";
GRANT ALL ON TABLE "public"."risk_scenarios" TO "service_role";



GRANT ALL ON TABLE "public"."risk_tags" TO "anon";
GRANT ALL ON TABLE "public"."risk_tags" TO "authenticated";
GRANT ALL ON TABLE "public"."risk_tags" TO "service_role";



GRANT ALL ON TABLE "public"."risks" TO "anon";
GRANT ALL ON TABLE "public"."risks" TO "authenticated";
GRANT ALL ON TABLE "public"."risks" TO "service_role";



GRANT ALL ON TABLE "public"."role_permissions" TO "anon";
GRANT ALL ON TABLE "public"."role_permissions" TO "authenticated";
GRANT ALL ON TABLE "public"."role_permissions" TO "service_role";



GRANT ALL ON TABLE "public"."roles" TO "anon";
GRANT ALL ON TABLE "public"."roles" TO "authenticated";
GRANT ALL ON TABLE "public"."roles" TO "service_role";



GRANT ALL ON TABLE "public"."rto_connections" TO "anon";
GRANT ALL ON TABLE "public"."rto_connections" TO "authenticated";
GRANT ALL ON TABLE "public"."rto_connections" TO "service_role";



GRANT ALL ON TABLE "public"."rto_projects" TO "anon";
GRANT ALL ON TABLE "public"."rto_projects" TO "authenticated";
GRANT ALL ON TABLE "public"."rto_projects" TO "service_role";



GRANT ALL ON TABLE "public"."rto_settings" TO "anon";
GRANT ALL ON TABLE "public"."rto_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."rto_settings" TO "service_role";



GRANT ALL ON TABLE "public"."safety_audits" TO "anon";
GRANT ALL ON TABLE "public"."safety_audits" TO "authenticated";
GRANT ALL ON TABLE "public"."safety_audits" TO "service_role";



GRANT ALL ON TABLE "public"."safety_moment_categories" TO "anon";
GRANT ALL ON TABLE "public"."safety_moment_categories" TO "authenticated";
GRANT ALL ON TABLE "public"."safety_moment_categories" TO "service_role";



GRANT ALL ON TABLE "public"."safety_moment_downloads" TO "anon";
GRANT ALL ON TABLE "public"."safety_moment_downloads" TO "authenticated";
GRANT ALL ON TABLE "public"."safety_moment_downloads" TO "service_role";



GRANT ALL ON TABLE "public"."safety_moment_shares" TO "anon";
GRANT ALL ON TABLE "public"."safety_moment_shares" TO "authenticated";
GRANT ALL ON TABLE "public"."safety_moment_shares" TO "service_role";



GRANT ALL ON TABLE "public"."safety_moment_views" TO "anon";
GRANT ALL ON TABLE "public"."safety_moment_views" TO "authenticated";
GRANT ALL ON TABLE "public"."safety_moment_views" TO "service_role";



GRANT ALL ON TABLE "public"."safety_moments" TO "anon";
GRANT ALL ON TABLE "public"."safety_moments" TO "authenticated";
GRANT ALL ON TABLE "public"."safety_moments" TO "service_role";



GRANT ALL ON TABLE "public"."safety_points" TO "anon";
GRANT ALL ON TABLE "public"."safety_points" TO "authenticated";
GRANT ALL ON TABLE "public"."safety_points" TO "service_role";



GRANT ALL ON TABLE "public"."safety_scores" TO "anon";
GRANT ALL ON TABLE "public"."safety_scores" TO "authenticated";
GRANT ALL ON TABLE "public"."safety_scores" TO "service_role";



GRANT ALL ON TABLE "public"."saved_casing_design_projects" TO "anon";
GRANT ALL ON TABLE "public"."saved_casing_design_projects" TO "authenticated";
GRANT ALL ON TABLE "public"."saved_casing_design_projects" TO "service_role";



GRANT ALL ON TABLE "public"."saved_compressor_pump_projects" TO "anon";
GRANT ALL ON TABLE "public"."saved_compressor_pump_projects" TO "authenticated";
GRANT ALL ON TABLE "public"."saved_compressor_pump_projects" TO "service_role";



GRANT ALL ON TABLE "public"."saved_dca_projects" TO "anon";
GRANT ALL ON TABLE "public"."saved_dca_projects" TO "authenticated";
GRANT ALL ON TABLE "public"."saved_dca_projects" TO "service_role";



GRANT ALL ON TABLE "public"."saved_drilling_fluids_projects" TO "anon";
GRANT ALL ON TABLE "public"."saved_drilling_fluids_projects" TO "authenticated";
GRANT ALL ON TABLE "public"."saved_drilling_fluids_projects" TO "service_role";



GRANT ALL ON TABLE "public"."saved_heat_exchanger_projects" TO "anon";
GRANT ALL ON TABLE "public"."saved_heat_exchanger_projects" TO "authenticated";
GRANT ALL ON TABLE "public"."saved_heat_exchanger_projects" TO "service_role";



GRANT ALL ON TABLE "public"."saved_mbal_projects" TO "anon";
GRANT ALL ON TABLE "public"."saved_mbal_projects" TO "authenticated";
GRANT ALL ON TABLE "public"."saved_mbal_projects" TO "service_role";



GRANT ALL ON TABLE "public"."saved_nodal_analysis_projects" TO "anon";
GRANT ALL ON TABLE "public"."saved_nodal_analysis_projects" TO "authenticated";
GRANT ALL ON TABLE "public"."saved_nodal_analysis_projects" TO "service_role";



GRANT ALL ON TABLE "public"."saved_petrophysics_projects" TO "anon";
GRANT ALL ON TABLE "public"."saved_petrophysics_projects" TO "authenticated";
GRANT ALL ON TABLE "public"."saved_petrophysics_projects" TO "service_role";



GRANT ALL ON TABLE "public"."saved_pipeline_sizer_projects" TO "anon";
GRANT ALL ON TABLE "public"."saved_pipeline_sizer_projects" TO "authenticated";
GRANT ALL ON TABLE "public"."saved_pipeline_sizer_projects" TO "service_role";



GRANT ALL ON TABLE "public"."saved_pvt_projects" TO "anon";
GRANT ALL ON TABLE "public"."saved_pvt_projects" TO "authenticated";
GRANT ALL ON TABLE "public"."saved_pvt_projects" TO "service_role";



GRANT ALL ON TABLE "public"."saved_quickvol_projects" TO "anon";
GRANT ALL ON TABLE "public"."saved_quickvol_projects" TO "authenticated";
GRANT ALL ON TABLE "public"."saved_quickvol_projects" TO "service_role";



GRANT ALL ON TABLE "public"."saved_relief_projects" TO "anon";
GRANT ALL ON TABLE "public"."saved_relief_projects" TO "authenticated";
GRANT ALL ON TABLE "public"."saved_relief_projects" TO "service_role";



GRANT ALL ON TABLE "public"."saved_report_autopilot_projects" TO "anon";
GRANT ALL ON TABLE "public"."saved_report_autopilot_projects" TO "authenticated";
GRANT ALL ON TABLE "public"."saved_report_autopilot_projects" TO "service_role";



GRANT ALL ON TABLE "public"."saved_reports" TO "anon";
GRANT ALL ON TABLE "public"."saved_reports" TO "authenticated";
GRANT ALL ON TABLE "public"."saved_reports" TO "service_role";



GRANT ALL ON TABLE "public"."saved_reservoir_balance_projects" TO "anon";
GRANT ALL ON TABLE "public"."saved_reservoir_balance_projects" TO "authenticated";
GRANT ALL ON TABLE "public"."saved_reservoir_balance_projects" TO "service_role";



GRANT ALL ON TABLE "public"."saved_well_cost_iq_projects" TO "anon";
GRANT ALL ON TABLE "public"."saved_well_cost_iq_projects" TO "authenticated";
GRANT ALL ON TABLE "public"."saved_well_cost_iq_projects" TO "service_role";



GRANT ALL ON TABLE "public"."saved_well_cost_projects" TO "anon";
GRANT ALL ON TABLE "public"."saved_well_cost_projects" TO "authenticated";
GRANT ALL ON TABLE "public"."saved_well_cost_projects" TO "service_role";



GRANT ALL ON TABLE "public"."scenario_comparisons" TO "anon";
GRANT ALL ON TABLE "public"."scenario_comparisons" TO "authenticated";
GRANT ALL ON TABLE "public"."scenario_comparisons" TO "service_role";



GRANT ALL ON TABLE "public"."scheduled_safety_moments" TO "anon";
GRANT ALL ON TABLE "public"."scheduled_safety_moments" TO "authenticated";
GRANT ALL ON TABLE "public"."scheduled_safety_moments" TO "service_role";



GRANT ALL ON TABLE "public"."security_incidents" TO "anon";
GRANT ALL ON TABLE "public"."security_incidents" TO "authenticated";
GRANT ALL ON TABLE "public"."security_incidents" TO "service_role";



GRANT ALL ON TABLE "public"."security_knowledge_assessments" TO "anon";
GRANT ALL ON TABLE "public"."security_knowledge_assessments" TO "authenticated";
GRANT ALL ON TABLE "public"."security_knowledge_assessments" TO "service_role";



GRANT ALL ON TABLE "public"."security_profiles" TO "anon";
GRANT ALL ON TABLE "public"."security_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."security_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."security_training" TO "anon";
GRANT ALL ON TABLE "public"."security_training" TO "authenticated";
GRANT ALL ON TABLE "public"."security_training" TO "service_role";



GRANT ALL ON TABLE "public"."shared_data_registry" TO "anon";
GRANT ALL ON TABLE "public"."shared_data_registry" TO "authenticated";
GRANT ALL ON TABLE "public"."shared_data_registry" TO "service_role";



GRANT ALL ON TABLE "public"."sim_cases" TO "anon";
GRANT ALL ON TABLE "public"."sim_cases" TO "authenticated";
GRANT ALL ON TABLE "public"."sim_cases" TO "service_role";



GRANT ALL ON TABLE "public"."sim_projects" TO "anon";
GRANT ALL ON TABLE "public"."sim_projects" TO "authenticated";
GRANT ALL ON TABLE "public"."sim_projects" TO "service_role";



GRANT ALL ON TABLE "public"."sip_faults" TO "anon";
GRANT ALL ON TABLE "public"."sip_faults" TO "authenticated";
GRANT ALL ON TABLE "public"."sip_faults" TO "service_role";



GRANT ALL ON TABLE "public"."sip_horizons" TO "anon";
GRANT ALL ON TABLE "public"."sip_horizons" TO "authenticated";
GRANT ALL ON TABLE "public"."sip_horizons" TO "service_role";



GRANT ALL ON TABLE "public"."sip_jobs" TO "anon";
GRANT ALL ON TABLE "public"."sip_jobs" TO "authenticated";
GRANT ALL ON TABLE "public"."sip_jobs" TO "service_role";



GRANT ALL ON TABLE "public"."sip_projects" TO "anon";
GRANT ALL ON TABLE "public"."sip_projects" TO "authenticated";
GRANT ALL ON TABLE "public"."sip_projects" TO "service_role";



GRANT ALL ON TABLE "public"."sip_surveys" TO "anon";
GRANT ALL ON TABLE "public"."sip_surveys" TO "authenticated";
GRANT ALL ON TABLE "public"."sip_surveys" TO "service_role";



GRANT ALL ON TABLE "public"."sip_uploads" TO "anon";
GRANT ALL ON TABLE "public"."sip_uploads" TO "authenticated";
GRANT ALL ON TABLE "public"."sip_uploads" TO "service_role";



GRANT ALL ON TABLE "public"."sip_versions" TO "anon";
GRANT ALL ON TABLE "public"."sip_versions" TO "authenticated";
GRANT ALL ON TABLE "public"."sip_versions" TO "service_role";



GRANT ALL ON TABLE "public"."sip_volumes" TO "anon";
GRANT ALL ON TABLE "public"."sip_volumes" TO "authenticated";
GRANT ALL ON TABLE "public"."sip_volumes" TO "service_role";



GRANT ALL ON TABLE "public"."sip_workspaces" TO "anon";
GRANT ALL ON TABLE "public"."sip_workspaces" TO "authenticated";
GRANT ALL ON TABLE "public"."sip_workspaces" TO "service_role";



GRANT ALL ON TABLE "public"."site_locations" TO "anon";
GRANT ALL ON TABLE "public"."site_locations" TO "authenticated";
GRANT ALL ON TABLE "public"."site_locations" TO "service_role";



GRANT ALL ON TABLE "public"."sites" TO "anon";
GRANT ALL ON TABLE "public"."sites" TO "authenticated";
GRANT ALL ON TABLE "public"."sites" TO "service_role";



GRANT ALL ON TABLE "public"."ss_assets" TO "anon";
GRANT ALL ON TABLE "public"."ss_assets" TO "authenticated";
GRANT ALL ON TABLE "public"."ss_assets" TO "service_role";



GRANT ALL ON TABLE "public"."ss_events" TO "anon";
GRANT ALL ON TABLE "public"."ss_events" TO "authenticated";
GRANT ALL ON TABLE "public"."ss_events" TO "service_role";



GRANT ALL ON TABLE "public"."ss_projects" TO "anon";
GRANT ALL ON TABLE "public"."ss_projects" TO "authenticated";
GRANT ALL ON TABLE "public"."ss_projects" TO "service_role";



GRANT ALL ON TABLE "public"."ss_styles" TO "anon";
GRANT ALL ON TABLE "public"."ss_styles" TO "authenticated";
GRANT ALL ON TABLE "public"."ss_styles" TO "service_role";



GRANT ALL ON TABLE "public"."ss_versions" TO "anon";
GRANT ALL ON TABLE "public"."ss_versions" TO "authenticated";
GRANT ALL ON TABLE "public"."ss_versions" TO "service_role";



GRANT ALL ON TABLE "public"."ss_workflow_runs" TO "anon";
GRANT ALL ON TABLE "public"."ss_workflow_runs" TO "authenticated";
GRANT ALL ON TABLE "public"."ss_workflow_runs" TO "service_role";



GRANT ALL ON TABLE "public"."ss_workflows" TO "anon";
GRANT ALL ON TABLE "public"."ss_workflows" TO "authenticated";
GRANT ALL ON TABLE "public"."ss_workflows" TO "service_role";



GRANT ALL ON TABLE "public"."stress_overrides" TO "anon";
GRANT ALL ON TABLE "public"."stress_overrides" TO "authenticated";
GRANT ALL ON TABLE "public"."stress_overrides" TO "service_role";



GRANT ALL ON TABLE "public"."studio_access_tokens" TO "anon";
GRANT ALL ON TABLE "public"."studio_access_tokens" TO "authenticated";
GRANT ALL ON TABLE "public"."studio_access_tokens" TO "service_role";



GRANT ALL ON TABLE "public"."studio_users" TO "anon";
GRANT ALL ON TABLE "public"."studio_users" TO "authenticated";
GRANT ALL ON TABLE "public"."studio_users" TO "service_role";



GRANT ALL ON TABLE "public"."subscription_events" TO "anon";
GRANT ALL ON TABLE "public"."subscription_events" TO "authenticated";
GRANT ALL ON TABLE "public"."subscription_events" TO "service_role";



GRANT ALL ON TABLE "public"."subscription_modules" TO "anon";
GRANT ALL ON TABLE "public"."subscription_modules" TO "authenticated";
GRANT ALL ON TABLE "public"."subscription_modules" TO "service_role";



GRANT ALL ON TABLE "public"."subscription_usage" TO "anon";
GRANT ALL ON TABLE "public"."subscription_usage" TO "authenticated";
GRANT ALL ON TABLE "public"."subscription_usage" TO "service_role";



GRANT ALL ON TABLE "public"."subscriptions" TO "anon";
GRANT ALL ON TABLE "public"."subscriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."subscriptions" TO "service_role";



GRANT ALL ON TABLE "public"."super_admin_impersonation_log" TO "anon";
GRANT ALL ON TABLE "public"."super_admin_impersonation_log" TO "authenticated";
GRANT ALL ON TABLE "public"."super_admin_impersonation_log" TO "service_role";



GRANT ALL ON TABLE "public"."support_ticket_comments" TO "anon";
GRANT ALL ON TABLE "public"."support_ticket_comments" TO "authenticated";
GRANT ALL ON TABLE "public"."support_ticket_comments" TO "service_role";



GRANT ALL ON TABLE "public"."support_tickets" TO "anon";
GRANT ALL ON TABLE "public"."support_tickets" TO "authenticated";
GRANT ALL ON TABLE "public"."support_tickets" TO "service_role";



GRANT ALL ON TABLE "public"."surveys" TO "anon";
GRANT ALL ON TABLE "public"."surveys" TO "authenticated";
GRANT ALL ON TABLE "public"."surveys" TO "service_role";



GRANT ALL ON TABLE "public"."system_settings" TO "anon";
GRANT ALL ON TABLE "public"."system_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."system_settings" TO "service_role";



GRANT ALL ON TABLE "public"."tasks" TO "anon";
GRANT ALL ON TABLE "public"."tasks" TO "authenticated";
GRANT ALL ON TABLE "public"."tasks" TO "service_role";



GRANT ALL ON TABLE "public"."team_app_access" TO "anon";
GRANT ALL ON TABLE "public"."team_app_access" TO "authenticated";
GRANT ALL ON TABLE "public"."team_app_access" TO "service_role";



GRANT ALL ON TABLE "public"."team_members" TO "anon";
GRANT ALL ON TABLE "public"."team_members" TO "authenticated";
GRANT ALL ON TABLE "public"."team_members" TO "service_role";



GRANT ALL ON TABLE "public"."teams" TO "anon";
GRANT ALL ON TABLE "public"."teams" TO "authenticated";
GRANT ALL ON TABLE "public"."teams" TO "service_role";



GRANT ALL ON TABLE "public"."template_usage" TO "anon";
GRANT ALL ON TABLE "public"."template_usage" TO "authenticated";
GRANT ALL ON TABLE "public"."template_usage" TO "service_role";



GRANT ALL ON TABLE "public"."templates" TO "anon";
GRANT ALL ON TABLE "public"."templates" TO "authenticated";
GRANT ALL ON TABLE "public"."templates" TO "service_role";



GRANT ALL ON TABLE "public"."tenants" TO "anon";
GRANT ALL ON TABLE "public"."tenants" TO "authenticated";
GRANT ALL ON TABLE "public"."tenants" TO "service_role";



GRANT ALL ON TABLE "public"."torque_drag_projects" TO "anon";
GRANT ALL ON TABLE "public"."torque_drag_projects" TO "authenticated";
GRANT ALL ON TABLE "public"."torque_drag_projects" TO "service_role";



GRANT ALL ON TABLE "public"."torque_drag_runs" TO "anon";
GRANT ALL ON TABLE "public"."torque_drag_runs" TO "authenticated";
GRANT ALL ON TABLE "public"."torque_drag_runs" TO "service_role";



GRANT ALL ON TABLE "public"."trajectory_plans" TO "anon";
GRANT ALL ON TABLE "public"."trajectory_plans" TO "authenticated";
GRANT ALL ON TABLE "public"."trajectory_plans" TO "service_role";



GRANT ALL ON TABLE "public"."transactions" TO "anon";
GRANT ALL ON TABLE "public"."transactions" TO "authenticated";
GRANT ALL ON TABLE "public"."transactions" TO "service_role";



GRANT ALL ON TABLE "public"."trend_analysis" TO "anon";
GRANT ALL ON TABLE "public"."trend_analysis" TO "authenticated";
GRANT ALL ON TABLE "public"."trend_analysis" TO "service_role";



GRANT ALL ON TABLE "public"."tubular_grades" TO "anon";
GRANT ALL ON TABLE "public"."tubular_grades" TO "authenticated";
GRANT ALL ON TABLE "public"."tubular_grades" TO "service_role";



GRANT ALL ON TABLE "public"."usage_metrics" TO "anon";
GRANT ALL ON TABLE "public"."usage_metrics" TO "authenticated";
GRANT ALL ON TABLE "public"."usage_metrics" TO "service_role";



GRANT ALL ON TABLE "public"."user_activity_logs" TO "anon";
GRANT ALL ON TABLE "public"."user_activity_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."user_activity_logs" TO "service_role";



GRANT ALL ON TABLE "public"."user_app_access" TO "anon";
GRANT ALL ON TABLE "public"."user_app_access" TO "authenticated";
GRANT ALL ON TABLE "public"."user_app_access" TO "service_role";



GRANT ALL ON TABLE "public"."user_badges" TO "anon";
GRANT ALL ON TABLE "public"."user_badges" TO "authenticated";
GRANT ALL ON TABLE "public"."user_badges" TO "service_role";



GRANT ALL ON TABLE "public"."user_currency_preference" TO "anon";
GRANT ALL ON TABLE "public"."user_currency_preference" TO "authenticated";
GRANT ALL ON TABLE "public"."user_currency_preference" TO "service_role";



GRANT ALL ON TABLE "public"."user_notifications" TO "anon";
GRANT ALL ON TABLE "public"."user_notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."user_notifications" TO "service_role";



GRANT ALL ON TABLE "public"."user_points_summary" TO "anon";
GRANT ALL ON TABLE "public"."user_points_summary" TO "authenticated";
GRANT ALL ON TABLE "public"."user_points_summary" TO "service_role";



GRANT ALL ON TABLE "public"."user_positions" TO "anon";
GRANT ALL ON TABLE "public"."user_positions" TO "authenticated";
GRANT ALL ON TABLE "public"."user_positions" TO "service_role";



GRANT ALL ON TABLE "public"."user_preferences" TO "anon";
GRANT ALL ON TABLE "public"."user_preferences" TO "authenticated";
GRANT ALL ON TABLE "public"."user_preferences" TO "service_role";



GRANT ALL ON TABLE "public"."user_profiles" TO "anon";
GRANT ALL ON TABLE "public"."user_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."user_saved_moments" TO "anon";
GRANT ALL ON TABLE "public"."user_saved_moments" TO "authenticated";
GRANT ALL ON TABLE "public"."user_saved_moments" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";



GRANT ALL ON TABLE "public"."v_org_app_seat_usage" TO "anon";
GRANT ALL ON TABLE "public"."v_org_app_seat_usage" TO "authenticated";
GRANT ALL ON TABLE "public"."v_org_app_seat_usage" TO "service_role";



GRANT ALL ON TABLE "public"."vulnerabilities" TO "anon";
GRANT ALL ON TABLE "public"."vulnerabilities" TO "authenticated";
GRANT ALL ON TABLE "public"."vulnerabilities" TO "service_role";



GRANT ALL ON TABLE "public"."waterflood_projects" TO "anon";
GRANT ALL ON TABLE "public"."waterflood_projects" TO "authenticated";
GRANT ALL ON TABLE "public"."waterflood_projects" TO "service_role";



GRANT ALL ON TABLE "public"."webhooks" TO "anon";
GRANT ALL ON TABLE "public"."webhooks" TO "authenticated";
GRANT ALL ON TABLE "public"."webhooks" TO "service_role";



GRANT ALL ON TABLE "public"."well_correlation_projects" TO "anon";
GRANT ALL ON TABLE "public"."well_correlation_projects" TO "authenticated";
GRANT ALL ON TABLE "public"."well_correlation_projects" TO "service_role";



GRANT ALL ON TABLE "public"."well_correlation_wells" TO "anon";
GRANT ALL ON TABLE "public"."well_correlation_wells" TO "authenticated";
GRANT ALL ON TABLE "public"."well_correlation_wells" TO "service_role";



GRANT ALL ON TABLE "public"."well_targets" TO "anon";
GRANT ALL ON TABLE "public"."well_targets" TO "authenticated";
GRANT ALL ON TABLE "public"."well_targets" TO "service_role";



GRANT ALL ON TABLE "public"."wellbore_flow_projects" TO "anon";
GRANT ALL ON TABLE "public"."wellbore_flow_projects" TO "authenticated";
GRANT ALL ON TABLE "public"."wellbore_flow_projects" TO "service_role";



GRANT ALL ON TABLE "public"."wells" TO "anon";
GRANT ALL ON TABLE "public"."wells" TO "authenticated";
GRANT ALL ON TABLE "public"."wells" TO "service_role";



GRANT ALL ON TABLE "public"."work_permits" TO "anon";
GRANT ALL ON TABLE "public"."work_permits" TO "authenticated";
GRANT ALL ON TABLE "public"."work_permits" TO "service_role";



GRANT ALL ON TABLE "public"."workflow_executions" TO "anon";
GRANT ALL ON TABLE "public"."workflow_executions" TO "authenticated";
GRANT ALL ON TABLE "public"."workflow_executions" TO "service_role";



GRANT ALL ON TABLE "public"."workflow_steps" TO "anon";
GRANT ALL ON TABLE "public"."workflow_steps" TO "authenticated";
GRANT ALL ON TABLE "public"."workflow_steps" TO "service_role";



GRANT ALL ON TABLE "public"."workflows" TO "anon";
GRANT ALL ON TABLE "public"."workflows" TO "authenticated";
GRANT ALL ON TABLE "public"."workflows" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






