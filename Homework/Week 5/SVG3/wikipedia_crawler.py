#!/usr/bin/python
# Name : Vincent Erich
# Student number : 10384081

# Python standard library imports.
import os
import json
import errno

# Third party library imports.
import pattern
from pattern.web import URL, DOM, plaintext

# Constants.
WIKIPEDIA_URL = "https://en.wikipedia.org/wiki/List_of_countries_and_dependencies_by_population"
OUTPUT_FILE = "countries_population.json"
SCRIPT_DIR = os.path.split(os.path.realpath(__file__))[0]
BACKUP_DIR = os.path.join(SCRIPT_DIR, "HTML_BACKUP")


def create_dir(directory):
    '''
    Create directory if needed.

    Args:
        directory: string, path of directory to be made


    Note: the backup directory is used to save the HTML of the pages you
        crawl.
    '''

    try:
        os.makedirs(directory)
    except OSError as e:
        if e.errno == errno.EEXIST:
            # Backup directory already exists, no problem for this script,
            # just ignore the exception and carry on.
            pass
        else:
            # All errors other than an already exising backup directory
            # are not handled, so the exception is re-raised and the 
            # script will crash here.
            raise


def make_backup(filename, html):
    '''
    Save HTML to file.

    Args:
        filename: absolute path of file to save
        html: (unicode) string of the html file

    '''

    with open(filename, 'wb+') as f:
        f.write(html)


def main():
	print "Setting up backup dir if needed..."
	create_dir(BACKUP_DIR)

	print "Accessing the Wikipedia page, making backup..."
	wikipedia_url = URL(WIKIPEDIA_URL)
	wikipedia_html = wikipedia_url.download(cached=True)
	make_backup(os.path.join(BACKUP_DIR, "index.html"), wikipedia_html)


	print "Scraping the Wikipedia page..."
	data_points = obtain_data(wikipedia_url)

	print "Saving data..."
	write_data(os.path.join(SCRIPT_DIR, OUTPUT_FILE), data_points)


def obtain_data(url):
	html = url.download(cached=True)
	dom = DOM(html)

	data_points = []

	for countries_table in dom.by_tag("table.wikitable sortable"):
		for table_row in countries_table.by_tag("tr")[1:]:
			table_row_content = []
			for table_row_cell in table_row.by_tag("td"):
				table_row_cell_content = unicode(plaintext(table_row_cell.content))
				table_row_content.append(table_row_cell_content)

			country = table_row_content[1].split("[")[0].split(" (")[0]
			population = "".join(table_row_content[2].split(","))
			# percentage = table_row_content[4]
			data_point = [country, population]
			data_points.append(data_point)

	return data_points


def write_data(file_name, data_points):
	json_representation = {"data": "Population per country.", "points": data_points}
	json_string = json.dumps(json_representation)
	with open(file_name, "wb+") as out:
		out.write(json_string)


if __name__ == "__main__":
	main()  # Call into the program.