-- Descrições de produto (ex.: importação marketplace) podem exceder VARCHAR padrão.
ALTER TABLE `product` MODIFY `description` TEXT NOT NULL;
