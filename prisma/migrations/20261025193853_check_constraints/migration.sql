-- Regras que o schema do Prisma não expressa: o banco recusa valores fora do domínio
-- mesmo que a validação da API (src/validate.js) falhe.
ALTER TABLE "controller_configs" ADD CONSTRAINT "controller_configs_slot_check" CHECK ("slot" IN (1, 2));

ALTER TABLE "matches" ADD CONSTRAINT "matches_winner_check" CHECK ("winner" IN (1, 2));
ALTER TABLE "matches" ADD CONSTRAINT "matches_scores_check" CHECK ("p1_score" >= 0 AND "p2_score" >= 0);
ALTER TABLE "matches" ADD CONSTRAINT "matches_target_points_check" CHECK ("target_points" BETWEEN 1 AND 20);
ALTER TABLE "matches" ADD CONSTRAINT "matches_duration_check" CHECK ("duration_ms" >= 0);

ALTER TABLE "match_rounds" ADD CONSTRAINT "match_rounds_winner_check" CHECK ("winner" IN (0, 1, 2));
ALTER TABLE "match_rounds" ADD CONSTRAINT "match_rounds_points_check" CHECK ("points" BETWEEN 0 AND 3);
ALTER TABLE "match_rounds" ADD CONSTRAINT "match_rounds_number_check" CHECK ("number" >= 1);
