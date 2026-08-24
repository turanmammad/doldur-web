# doldur-web

**Doldur** — Azərbaycanda elektromobil şarj xəritəsi · rəsmi sayt.
🌐 https://doldur.pro-tech.az

## 🔴 Bu repo ƏL İLƏ REDAKTƏ EDİLMİR

Sayt dizayn faylından qurulur:

```
~/projects/doldur/design/Doldur Sayt.dc.html   ← mənbə
~/projects/doldur/tools/build_site.py          ← qurucu
~/projects/doldur/web/                         ← nəticə
```

Yeniləmək:

```bash
cd ~/projects/doldur
bash tools/deploy_site.sh
```

Buradakı fayllara birbaşa edilən düzəliş növbəti qurulmada **İTİR** (`rsync --delete`).

Detal: `~/projects/doldur/docs/site.md`
