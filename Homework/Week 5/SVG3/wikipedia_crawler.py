#!/usr/bin/python
# Name : Vincent Erich
# Student number : 10384081

'''
wikipedia_crawler.py

This script crawls the Wikipedia page on countries and dependencies by
population.
'''

# Python standard library imports.
import os
import json
import errno

# Third party library imports.
import pattern
from pattern.web import URL, DOM, plaintext

#-----------------------------------------------------------------------------

# Constants.
WIKIPEDIA_URL = "https://en.wikipedia.org/wiki/List_of_countries_and_dependencies_by_population"
OUTPUT_FILE = "countries_population.json"
SCRIPT_DIR = os.path.split(os.path.realpath(__file__))[0]
BACKUP_DIR = os.path.join(SCRIPT_DIR, "HTML_BACKUP")

#-----------------------------------------------------------------------------

def create_dir(directory):
    '''
    Create a directory if needed.

    Args:
        directory: string, path of the directory to be made


    Note: the backup directory is used to save the HTML of the page I crawl.
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


def make_backup(file_name, html):
    '''
    Save HTML to file.

    Args:
        filename: absolute path of file to save
        html: (unicode) string of the html file

    '''

    with open(file_name, 'wb+') as f:
        f.write(html)


def main():
	'''
	Crawl the Wikipedia page, sava a .json file with the (needed) information.
	'''

	# Create a directory to store a copy of the HTML file.
	print "Setting up backup dir if needed..."
	create_dir(BACKUP_DIR)

	# Make a backup of the Wikipedia page.
	print "Accessing the Wikipedia page, making backup..."
	wikipedia_url = URL(WIKIPEDIA_URL)
	wikipedia_html = wikipedia_url.download(cached=True)
	make_backup(os.path.join(BACKUP_DIR, "index.html"), wikipedia_html)

	# Obtain the (needed) information (i.e., the data).
	print "Scraping the Wikipedia page..."
	data_points = obtain_data(wikipedia_url)

	# Save a .json file with the (needed) information (i.e., the data).
	print "Saving data..."
	write_data(os.path.join(SCRIPT_DIR, OUTPUT_FILE), data_points)


def obtain_data(url):
	'''
	Scrape the Wikipedia page.

	Args:
		url: pattern.web.URL instance pointing to the Wikipedia page

	Returns:
		A list of lists, where each sublist represents a data point. Each
		sublist contains two elements: a string with the name of the country,
		and a string with the size of the population of that country. 
	'''

	# Create a DOM of the URL.
	html = url.download(cached=True)
	dom = DOM(html)

	data_points = []

	for countries_table in dom.by_tag("table.wikitable sortable"):
		for table_row in countries_table.by_tag("tr")[1:]:	# The first row is the header, so start at index 1.
			table_row_content = []
			# Obtain the content of the row.
			for table_row_cell in table_row.by_tag("td"):
				table_row_cell_content = unicode(plaintext(table_row_cell.content))
				table_row_content.append(table_row_cell_content)
			# Obtain the country name and the population size.
			country = table_row_content[1].split("[")[0].split(" (")[0]
			population = "".join(table_row_content[2].split(","))
			data_point = [country, population]
			data_points.append(data_point)

	return data_points


def write_data(file_name, data_points):
	'''
	Save a .json file with the (needed) information from the Wikipedia page
	(i.e., the data).

	Args:
		file_name: string, file name for the .json file
		data_points: the data points to be saved
	'''

	json_representation = {"data": "Population per country.", "points": data_points}
	json_string = json.dumps(json_representation)
	with open(file_name, "wb+") as out:
		out.write(json_string)


if __name__ == "__main__":
	main()  # Call into the program.