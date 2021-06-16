Instalace
=========
- ve složce /docker jsou scripty pro vytvoření databáze a webového serveru
- ve složce /sql jsou scripty pro vytvořebí tabulek a zkušebních dat. Dále je tam kompletní databázový dump

Formuláře
=========
- formuláře jsou řešeny prostřednictvím Nette snippetů
- validace se provádí nejdŕíve v prohližeči s pomocí netteForms.min.js. Validační chyby se zobrazují přímo u pole.
- povinná pole mají žluté pozadí  
- pro česká PSČ je použita input mask
- státy, obce a PSČ jsou opatřeny našeptávači. Našeptávače PSČ a obce jsou vázané, našeptávají se pouze obce daného PSČ
- číselník PSČ a obcí je převzatý od České pośty s upravenými názvy některých obcí (opravena nesystematičmost v Praze)
- číselník statů je dle ISO  
- u adresy je add-on pro lokalizaci v Google Maps

Gridy
=====
- pro grid uživatelů a adres uživatele je použit Contributte Datagrid (dříve Ublabloo Datagrid)
- doplněna tlačítka pro editaci, smazání a lokalizaci

API json
=========
- implementováno v /app/Model/UserInfo
- metody jsou zpublikované přes http rozhraní  
- výstup všech uživatelů - http://domain/users/data
- detail uživatele - napŕ. http://domain/user/data/1
