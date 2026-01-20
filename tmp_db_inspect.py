import sqlite3
path = r"WebSite\\BackEnd\\bridgeus.db"
conn = sqlite3.connect(path)
conn.row_factory = sqlite3.Row
cur = conn.cursor()

print('Profiles (recent updated_at):')
for row in cur.execute("SELECT user_id, display_name, language_preference, updated_at FROM profiles ORDER BY updated_at DESC LIMIT 10"):
    print(dict(row))

print('\nPost + Profile (latest 10):')
query = """
SELECT p.id as post_id, p.author_id, p.status, p.created_at,
       pr.display_name, u.email
FROM posts p
LEFT JOIN profiles pr ON pr.user_id = p.author_id
LEFT JOIN users u ON u.id = p.author_id
ORDER BY p.created_at DESC
LIMIT 10
"""
for row in cur.execute(query):
    print(dict(row))
