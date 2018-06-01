SELECT CURRENT_DATE;

DROP TABLE IF EXISTS notes_tags;
DROP TABLE IF EXISTS tags;
DROP TABLE IF EXISTS notes;
DROP TABLE IF EXISTS folders;

CREATE TABLE folders (
    id serial PRIMARY KEY,
    name text NOT NULL
);

ALTER SEQUENCE folders_id_seq
    RESTART WITH 100;


CREATE TABLE notes(
    id serial PRIMARY KEY,
    title text NOT NULL,
    content text,
    created timestamp DEFAULT current_timestamp,
    folder_id int references folders(id) ON DELETE SET NULL
);

CREATE TABLE tags(
    id serial PRIMARY KEY,
    name text NOT NULL UNIQUE
);

CREATE TABLE notes_tags(
    note_id INTEGER NOT NULL REFERENCES notes ON DELETE CASCADE,
    tag_id INTEGER NOT NULL REFERENCES tags ON DELETE CASCADE
);



ALTER SEQUENCE notes_id_seq
    RESTART WITH 1000;


INSERT INTO folders (name) VALUES
    ('Archive'),
    ('Drafts'),
    ('Personal'),
    ('Work');

INSERT INTO notes (title, content, folder_id) VALUES
    ('5 life lessons learned from cats', 'lorem ipsum', 100),
    ('Do the dishes', 'placeholder text', 101),
    ('Wash the car', 'placeholder text', 100),
    ('Grocery shopping', 'placeholder text', 102),
    ('Clean the basement', 'placeholder text', 103);

INSERT INTO tags (name) VALUES 
    ('foo'),
    ('bar'),
    ('spam'),
    ('eggs');

INSERT INTO notes_tags (note_id, tag_id) VALUES
    ('1000', '1'),
    ('1001', '2'),
    ('1002', '3'),
    ('1003', '4'),
    ('1004', '2');

SELECT title, tags.name, folders.name FROM notes
LEFT JOIN folders ON notes.folder_id = folders.id
LEFT JOIN notes_tags ON notes.id = notes_tags.note_id
LEFT JOIN tags ON notes_tags.tag_id = tags.id;