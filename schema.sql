CREATE TABLE IF NOT EXISTS posts(id INTEGER PRIMARY KEY AUTOINCREMENT,slug TEXT UNIQUE,title TEXT,title_en TEXT,excerpt TEXT,excerpt_en TEXT,body TEXT,body_en TEXT,cover TEXT,cat TEXT,published INTEGER DEFAULT 1,created TEXT);
CREATE TABLE IF NOT EXISTS images(id INTEGER PRIMARY KEY AUTOINCREMENT,data TEXT);
CREATE TABLE IF NOT EXISTS settings(k TEXT PRIMARY KEY,v TEXT);
INSERT INTO posts(slug,title,title_en,excerpt,excerpt_en,body,body_en,cat,published,created) VALUES('bai-viet-dau-tien','Bài viết đầu tiên','First post','Đây là bài mẫu. Hãy vào /admin để sửa hoặc xóa.','Sample post. Go to /admin to edit or delete.','<p>Xin chào! Đây là bài viết mẫu.</p>','<p>Hello! This is a sample post.</p>','Tin tức',1,date('now'));

