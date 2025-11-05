                                    pg_get_functiondef                                    
------------------------------------------------------------------------------------------
 CREATE OR REPLACE FUNCTION public.trg_fn_users_mirror_aff_v2()                          +
  RETURNS trigger                                                                        +
  LANGUAGE plpgsql                                                                       +
  SECURITY DEFINER                                                                       +
  SET search_path TO 'public'                                                            +
 AS $function$                                                                           +
 DECLARE                                                                                 +
   parent_uuid uuid;                                                                     +
 BEGIN                                                                                   +
   IF TG_OP = 'INSERT'                                                                   +
      OR (TG_OP = 'UPDATE' AND (NEW."referredBy" IS DISTINCT FROM OLD."referredBy")) THEN+
                                                                                         +
     IF NEW."referredBy" IS NULL OR NEW."referredBy" = '' THEN                           +
       RETURN NEW;                                                                       +
     END IF;                                                                             +
                                                                                         +
     -- 1) tentar como UUID                                                              +
     BEGIN                                                                               +
       parent_uuid := NEW."referredBy"::uuid;                                            +
     EXCEPTION WHEN invalid_text_representation THEN                                     +
       parent_uuid := NULL;                                                              +
     END;                                                                                +
                                                                                         +
     -- 2) se não for UUID, resolver como referralCode -> id (uuid)                      +
     IF parent_uuid IS NULL THEN                                                         +
       SELECT u.id::uuid                                                                 +
         INTO parent_uuid                                                                +
       FROM public.users u                                                               +
       WHERE u."referralCode" = NEW."referredBy"                                         +
       LIMIT 1;                                                                          +
     END IF;                                                                             +
                                                                                         +
     -- 3) sem UUID válido -> não espelha (evita erro)                                   +
     IF parent_uuid IS NULL THEN                                                         +
       RETURN NEW;                                                                       +
     END IF;                                                                             +
                                                                                         +
     -- 4) vínculo idempotente                                                           +
     INSERT INTO public.affiliate_referrals (parent_user_id, child_user_id, "createdAt") +
     VALUES (parent_uuid, NEW.id::uuid, COALESCE(NEW."createdAt", NOW()))                +
     ON CONFLICT (parent_user_id, child_user_id) DO NOTHING;                             +
                                                                                         +
     -- 5) normaliza users."referredBy" para UUID (texto)                                +
     IF NEW."referredBy" <> parent_uuid::text THEN                                       +
       UPDATE public.users                                                               +
       SET "referredBy" = parent_uuid::text                                              +
       WHERE id::uuid = NEW.id::uuid;                                                    +
     END IF;                                                                             +
                                                                                         +
   END IF;                                                                               +
                                                                                         +
   RETURN NEW;                                                                           +
 END;                                                                                    +
 $function$                                                                              +
 
(1 row)

