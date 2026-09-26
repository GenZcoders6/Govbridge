import sqlite3

conn = sqlite3.connect("govbridge_dev.db")
c = conn.cursor()
for name in ["identity", "education", "employment", "skill", "revenue", "welfare"]:
    c.execute(f"UPDATE connectors SET base_url = REPLACE(base_url, 'mock-{name}', '127.0.0.1')")
conn.commit()

c.execute("SELECT code, base_url FROM connectors")
for row in c.fetchall():
    print(row)
conn.close()
