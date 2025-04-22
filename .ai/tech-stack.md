Frontend - Astro z React dla komponentów interaktywnych:
- Astro 5 pozwala na tworzenie szybkich, wydajnych stron i aplikacji z minimalną ilością JavaScript
- React 19 zapewni interaktywność tam, gdzie jest potrzebna
- TypeScript 5 dla statycznego typowania kodu i lepszego wsparcia IDE
- Tailwind 4 pozwala na wygodne stylowanie aplikacji
- Shadcn/ui zapewnia bibliotekę dostępnych komponentów React, na których oprzemy UI

Backend - Supabase jako kompleksowe rozwiązanie backendowe:
- Zapewnia bazę danych PostgreSQL
- Zapewnia SDK w wielu językach, które posłużą jako Backend-as-a-Service
- Jest rozwiązaniem open source, które można hostować lokalnie lub na własnym serwerze
- Posiada wbudowaną autentykację użytkowników

AI - Komunikacja z modelami przez usługę Openrouter.ai:
- Dostęp do szerokiej gamy modeli (OpenAI, Anthropic, Google i wiele innych), które pozwolą nam znaleźć rozwiązanie zapewniające wysoką efektywność i niskie koszta
- Pozwala na ustawianie limitów finansowych na klucze API

CI/CD i Hosting:
- Github Actions do tworzenia pipeline'ów CI/CD
- Cloudflare Pages do hostowania aplikacji

Testowanie:
- Testy jednostkowe:
  - Vitest jako główny framework testowy, szybszy i lepiej zintegrowany z Astro
  - React Testing Library z @testing-library/user-event do testowania komponentów React
  - MSW (Mock Service Worker) do mockowania API Supabase

- Testy end-to-end (E2E):
  - Playwright jako główne narzędzie do testów E2E na różnych przeglądarkach
  - Storybook do izolowanego testowania i dokumentacji komponentów UI
  - Percy/Chromatic do testów regresji wizualnej

- Inne narzędzia testowe:
  - Sentry do śledzenia błędów w czasie rzeczywistym
  - TestRail/Zephyr do zarządzania przypadkami testowymi
  - Lighthouse do analizy wydajności frontendu