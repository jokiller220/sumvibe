-- SQL MIGRATION : Gestion du stock de billets (Sold Out) en temps réel

-- 1. Fonction qui incrémente la colonne "sold" dans sv_ticket_types
CREATE OR REPLACE FUNCTION increment_ticket_sold()
RETURNS TRIGGER AS $$
BEGIN
  -- Met à jour sv_ticket_types : ajoute la quantité achetée au nombre de places vendues
  UPDATE sv_ticket_types
  SET sold = COALESCE(sold, 0) + NEW.quantity
  WHERE id = NEW.ticket_type_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Création du Trigger sur sv_purchases
-- Il s'exécute automatiquement après chaque nouvel achat (INSERT)
DROP TRIGGER IF EXISTS tr_increment_ticket_sold ON sv_purchases;
CREATE TRIGGER tr_increment_ticket_sold
AFTER INSERT ON sv_purchases
FOR EACH ROW
EXECUTE FUNCTION increment_ticket_sold();

-- Note : Ce mécanisme garantit que le stock est toujours exact, même lors d'achats simultanés.
