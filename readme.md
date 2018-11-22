Warlocks Realtime
================

A proxy wrapper for Raven Black's [Warlocks](https://games.ravenblack.net/player). 
It injects a little bit of javascript to the site adding the following features:

* On submitting orders, remain on the battle page
* Poll for next turn
* Display system notification when new turn begins and refresh page

This allows running fast paced games with people you know.

Install
======
Minimal instructions

```pip install -r requirements.txt```
```python manage.py runserver_plus --cert path/to/cert.crt 0.0.0.0:8123```

