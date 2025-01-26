.PHONY: export_schema

export_schema:
	sqlite3 data/second_opinion.sqlite ".schema" > data/schema.sql
	