# Affiliates – operação e auditoria
- Trigger: public.trg_fn_users_mirror_aff_v2 (SECURITY DEFINER, search_path=public)
- Índices: 
  - idx_aff_referrals_parent_createdat (parent_user_id, createdAt DESC)
  - idx_aff_referrals_createdat (createdAt DESC)
- Constraints:
  - users_referredby_uuid_chk (NULL ou UUID como texto)
  - users_no_self_referral_chk (sem auto-referência)
- Guard: ops/guards/bf_aff_guard.sh (health + stats + verificação de índices/trigger)
- View: public.v_affiliate_links (parent/child/linked_at)
