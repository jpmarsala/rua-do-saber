-- Categoria do cliente: prefeitura, agência de trânsito ou escola (quando o cliente é uma única escola).
-- Abaixo do cliente ficam sempre as escolas (tabela schools). O gestor adiciona uma ou várias escolas.
ALTER TABLE tenants
ADD COLUMN IF NOT EXISTS client_type text NOT NULL DEFAULT 'prefeitura'
CHECK (client_type IN ('prefeitura', 'agencia_transito', 'escola'));

COMMENT ON COLUMN tenants.client_type IS 'prefeitura | agencia_transito | escola';
