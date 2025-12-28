-- ######################################################################
-- # QUERIES DE DEMONSTRAÇÃO PARA APRESENTAÇÃO
-- # Base de Dados: Finanças Inteligentes
-- # Schema: users, expenses, categories, budgets, savings_goals, investments, investment_tx, notifications
-- ######################################################################

-- Nota: Assumimos que o utilizador a testar tem o ID = 101.
-- Certifique-se de que insere dados de teste primeiro para que estas queries funcionem!

-- ##################################################
-- # SECÇÃO 1: UTILIZADORES E CATEGORIAS (Setup Básico)
-- ##################################################

-- 1.1. Inserir um novo utilizador (simulação após login OAuth)
INSERT INTO users (external_id, provider, display_name, email)
VALUES ('google_1234567890', 'google', 'Pedro Silva', 'pedro.silva@exemplo.com')
ON CONFLICT (email) DO NOTHING; -- Evita erro se o email já existir

-- 1.2. Criar categorias personalizadas para o utilizador 101
INSERT INTO categories (user_id, name, colour)
VALUES
    (101, 'Alimentação', '#FF5733'),
    (101, 'Transporte', '#337AFF'),
    (101, 'Lazer', '#33FF49')
ON CONFLICT (name, user_id) DO NOTHING;

-- ##################################################
-- # SECÇÃO 2: EXPENSES (Despesas/Receitas)
-- ##################################################

-- 2.1. Inserir Despesas e Receitas de Exemplo
-- Assumimos: category_id 1 = Alimentação, 2 = Transporte, 3 = Lazer
INSERT INTO expenses (user_id, type, amount, currency, category_id, date, notes)
VALUES
    (101, 'income', 2500.00, 'EUR', NULL, '2025-11-01', 'Salário Mensal'),
    (101, 'expense', 15.50, 'EUR', 1, '2025-11-05', 'Jantar de Terça-feira'),
    (101, 'expense', 40.00, 'EUR', 2, '2025-11-08', 'Bilhetes de Comboio'),
    (101, 'expense', 150.00, 'EUR', 3, '2025-11-15', 'Concerto');

-- 2.2. Query de Demonstração Principal: Obter o saldo Líquido do Mês
-- Demonstra cálculo de Receitas - Despesas
SELECT
    SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS total_income,
    SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS total_expense,
    (SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) - SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END)) AS net_balance
FROM
    expenses
WHERE
    user_id = 101
    AND date BETWEEN '2025-11-01' AND '2025-11-30';

-- 2.3. Query de Demonstração: Análise de gastos por categoria
SELECT
    c.name AS category,
    SUM(e.amount) AS total_spent
FROM
    expenses e
JOIN
    categories c ON e.category_id = c.id
WHERE
    e.user_id = 101
    AND e.type = 'expense'
    AND e.date BETWEEN '2025-11-01' AND '2025-11-30'
GROUP BY
    c.name
ORDER BY
    total_spent DESC;


-- ##################################################
-- # SECÇÃO 3: BUDGETS (Orçamentos)
-- ##################################################

-- 3.1. Inserir um novo Orçamento (ex: 200€ por mês para Alimentação)
INSERT INTO budgets (user_id, name, amount, period, start_date)
VALUES (101, 'Orçamento Alimentação Mensal', 200.00, 'monthly', '2025-11-01');

-- 3.2. Query de Demonstração: Obter o progresso de um orçamento
-- Requer a junção entre a tabela 'budgets' e 'expenses'
SELECT
    b.name AS budget_name,
    b.amount AS planned_amount,
    COALESCE(SUM(e.amount), 0) AS actual_spent,
    (b.amount - COALESCE(SUM(e.amount), 0)) AS remaining
FROM
    budgets b
LEFT JOIN
    expenses e ON b.user_id = e.user_id AND e.type = 'expense'
    -- Assumindo que o orçamento é para a categoria "Alimentação" (ID 1)
    AND e.category_id = 1
    AND e.date BETWEEN b.start_date AND COALESCE(b.end_date, '2025-11-30') -- Usa o fim do mês como fallback
WHERE
    b.user_id = 101
    AND b.name = 'Orçamento Alimentação Mensal'
GROUP BY
    b.id, b.name, b.amount;


-- ##################################################
-- # SECÇÃO 4: SAVINGS_GOALS (Objetivos de Poupança)
-- ##################################################

-- 4.1. Inserir um novo objetivo
INSERT INTO savings_goals (user_id, name, target_amount, current_amount, deadline)
VALUES (101, 'Viagem a Tóquio', 5000.00, 1500.00, '2026-06-30');

-- 4.2. Query de Demonstração: Obter o progresso do Objetivo
SELECT
    name AS goal_name,
    target_amount,
    current_amount,
    (current_amount / target_amount * 100) AS percentage_complete,
    deadline
FROM
    savings_goals
WHERE
    user_id = 101
ORDER BY
    deadline ASC;


-- ##################################################
-- # SECÇÃO 5: INVESTMENTS (Investimentos)
-- ##################################################

-- 5.1. Inserir um novo ativo e transação de compra
INSERT INTO investments (user_id, symbol, market, quantity, avg_price, currency)
VALUES (101, 'TSLA', 'stock', 10.0, 250.00, 'USD')
ON CONFLICT (user_id, symbol) DO NOTHING;

-- 5.2. Inserir uma transação de compra (investment_tx)
INSERT INTO investment_tx (investment_id, type, quantity, price, date)
VALUES (
    (SELECT id FROM investments WHERE user_id = 101 AND symbol = 'TSLA'), -- Obtém o ID do ativo
    'buy', 5.0, 255.00, '2025-11-20'
);

-- 5.3. Query de Demonstração: Obter o portefólio completo com valorização
-- Demonstra o cálculo de valor atual (Assumindo um last_price fictício para demonstração)
UPDATE investments SET last_price = 260.00 WHERE user_id = 101 AND symbol = 'TSLA';

SELECT
    symbol,
    market,
    quantity,
    avg_price,
    last_price,
    (quantity * last_price) AS current_market_value,
    ((quantity * last_price) - (quantity * avg_price)) AS unrealized_profit
FROM
    investments
WHERE
    user_id = 101
    AND quantity > 0;

-- ##################################################
-- # SECÇÃO 6: NOTIFICATIONS (Notificações)
-- ##################################################

-- 6.1. Inserir uma nova notificação (Alerta de Orçamento)
INSERT INTO notifications (user_id, type, payload)
VALUES (
    101,
    'alert',
    '{"message": "Atenção! Você usou 80% do seu orçamento de Alimentação para Novembro.", "context": "budget_alert"}'::jsonb
);

-- 6.2. Query de Demonstração: Obter notificações não lidas
SELECT
    created_at,
    type,
    payload->>'message' AS message, -- Extrai a mensagem do JSONB
    is_read
FROM
    notifications
WHERE
    user_id = 101
    AND is_read = FALSE
ORDER BY
    created_at DESC;