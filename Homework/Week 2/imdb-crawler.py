#!/usr/bin/env python
# Name : Vincent Erich
# Student number : 10384081

'''
This script crawls the IMDB top 250 movies.
'''

# Python standard library imports:
import os
import sys
import csv
import codecs
import cStringIO
import errno

# Third party library imports:
import pattern
from pattern.web import URL, DOM, plaintext

# --------------------------------------------------------------------------

# Constants:
TOP_250_URL = 'http://www.imdb.com/chart/top'
OUTPUT_CSV = 'top250movies.csv'
SCRIPT_DIR = os.path.split(os.path.realpath(__file__))[0]
BACKUP_DIR = os.path.join(SCRIPT_DIR, 'HTML_BACKUPS')

# --------------------------------------------------------------------------

# Unicode reading/writing functionality for the Python CSV module, taken
# from the Python.org csv module documentation (very slightly adapted).
# Source: http://docs.python.org/2/library/csv.html (retrieved 2014-03-09).

class UTF8Recoder(object):
    """
    Iterator that reads an encoded stream and reencodes the input to UTF-8
    """
    def __init__(self, f, encoding):
        self.reader = codecs.getreader(encoding)(f)

    def __iter__(self):
        return self

    def next(self):
        return self.reader.next().encode("utf-8")


class UnicodeReader(object):
    """
    A CSV reader which will iterate over lines in the CSV file "f",
    which is encoded in the given encoding.
    """

    def __init__(self, f, dialect=csv.excel, encoding="utf-8", **kwds):
        f = UTF8Recoder(f, encoding)
        self.reader = csv.reader(f, dialect=dialect, **kwds)

    def next(self):
        row = self.reader.next()
        return [unicode(s, "utf-8") for s in row]

    def __iter__(self):
        return self


class UnicodeWriter(object):
    """
    A CSV writer which will write rows to CSV file "f",
    which is encoded in the given encoding.
    """

    def __init__(self, f, dialect=csv.excel, encoding="utf-8", **kwds):
        # Redirect output to a queue
        self.queue = cStringIO.StringIO()
        self.writer = csv.writer(self.queue, dialect=dialect, **kwds)
        self.stream = f
        self.encoder = codecs.getincrementalencoder(encoding)()

    def writerow(self, row):
        self.writer.writerow([s.encode("utf-8") for s in row])
        # Fetch UTF-8 output from the queue ...
        data = self.queue.getvalue()
        data = data.decode("utf-8")
        # ... and reencode it into the target encoding
        data = self.encoder.encode(data)
        # write to the target stream
        self.stream.write(data)
        # empty queue
        self.queue.truncate(0)

    def writerows(self, rows):
        for row in rows:
            self.writerow(row)

# --------------------------------------------------------------------------

# Utility functions (no need to edit):

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


def save_csv(filename, rows):
    '''
    Save CSV file with the top 250 most popular movies on IMDB.

    Args:
        filename: string filename for the CSV file
        rows: list of rows to be saved (250 movies in this exercise)
    '''
    with open(filename, 'wb') as f:
        writer = UnicodeWriter(f)  # implicitly UTF-8
        writer.writerow([
            'title', 'runtime', 'genre(s)', 'director(s)', 'writer(s)',
            'actor(s)', 'rating(s)', 'number of rating(s)'
        ])

        writer.writerows(rows)


def make_backup(filename, html):
    '''
    Save HTML to file.

    Args:
        filename: absolute path of file to save
        html: (unicode) string of the html file

    '''

    with open(filename, 'wb') as f:
        f.write(html)


def main():
    '''
    Crawl the IMDB top 250 movies, save CSV with their information.

    Note:
        This function also makes backups of the HTML files in a sub-directory
        called HTML_BACKUPS (those will be used in grading).
    '''

    # Create a directory to store copies of all the relevant HTML files (those
    # will be used in testing).
    print 'Setting up backup dir if needed ...'
    create_dir(BACKUP_DIR)

    # Make backup of the IMDB top 250 movies page
    print 'Access top 250 page, making backup ...'
    top_250_url = URL(TOP_250_URL)
    top_250_html = top_250_url.download(cached=True)
    make_backup(os.path.join(BACKUP_DIR, 'index.html'), top_250_html)

    # extract the top 250 movies
    print 'Scraping top 250 page ...'
    url_strings = scrape_top_250(top_250_url)

    # grab all relevant information from the 250 movie web pages
    rows = []
    for i, url in enumerate(url_strings):  # Enumerate, a great Python trick!
        print 'Scraping movie %d ...' % i
        # Grab web page
        movie_html = URL(url).download(cached=True)

        # Extract relevant information for each movie
        movie_dom = DOM(movie_html)
        rows.append(scrape_movie_page(movie_dom))

        # Save one of the IMDB's movie pages (for testing)
        if i == 83:
            html_file = os.path.join(BACKUP_DIR, 'movie-%03d.html' % i)
            make_backup(html_file, movie_html)

    # Save a CSV file with the relevant information for the top 250 movies.
    print 'Saving CSV ...'
    save_csv(os.path.join(SCRIPT_DIR, 'top250movies.csv'), rows)

# --------------------------------------------------------------------------

# Functions to adapt or provide implementations for:

def scrape_top_250(url):
    '''
    Scrape the IMDB top 250 movies index page.

    Args:
        url: pattern.web.URL instance pointing to the top 250 index page

    Returns:
        A list of strings, where each string is the URL to a movie's page on
        IMDB, note that these URLS must be absolute (i.e. include the http
        part, the domain part and the path part).
    '''

    movie_urls = []

    # YOUR SCRAPING CODE GOES HERE, ALL YOU ARE LOOKING FOR ARE THE ABSOLUTE
    # URLS TO EACH MOVIE'S IMDB PAGE, ADD THOSE TO THE LIST movie_urls.

    # Create a DOM of the URL.
    html = url.download(cashed=True)
    dom = DOM(html)

    for movie_table in dom.by_tag("table.chart full-width"):
        for movie_table_row in movie_table.by_tag("tr")[1:251]: # The first row is redundant, so start from index 1.
            for movie_table_row_cell in movie_table_row.by_tag("td.titleColumn"):
                for a in movie_table_row_cell.by_tag("a"):
                    # Obtain the path of the URL to the movie's page, create an absolute URL, and append it to the list 'movie_urls'. 
                    movie_url_path = a.attrs["href"]
                    absolute_movie_url = "".join(["http://www.imdb.com/", movie_url_path])
                    movie_urls.append(absolute_movie_url)

    # Return the list of URLs of each movie's page on IMDB.
    return movie_urls


def scrape_movie_page(dom):
    '''
    Scrape the IMDB page for a single movie

    Args:
        dom: pattern.web.DOM instance representing the page of 1 single
            movie.

    Returns:
        A list of strings representing the following (in order): title, year,
        duration, genre(s) (semicolon separated if several), director(s) 
        (semicolon separated if several), writer(s) (semicolon separated if
        several), actor(s) (semicolon separated if several), rating, number
        of ratings.
    '''

    # YOUR SCRAPING CODE GOES HERE:

    # Obtain the title.
    for h1 in dom.by_tag("h1.header"):
        for span in h1.by_tag("span")[:1]: # Only the first <span> contains the movie title.
            title = unicode(plaintext(span.content))
            print "Title: " + title

    # Obtain the duration and genre(s).
    for div in dom.by_tag("div.infobar"):
        info = unicode(plaintext(div.content))
        # First, remove all the whitespace from 'info', then split on '|'.
        info_splitted = "".join(info.split()).split("|")
        duration = info_splitted[1].replace("min", "")
        genres =";".join(info_splitted[2].split(","))
        print "Duration: " + duration
        print "Genres: " + genres

    # Obtain the rating and the number of ratings.
    for div in dom.by_tag("div.star-box giga-star"):
        for rating_div in div.by_tag("div.titlePageSprite star-box-giga-star"):
            rating = unicode(plaintext(rating_div.content))
            rating = "".join(rating.split())
            print "Rating: " + rating

        for details_div in div.by_tag("div.star-box-details"):
            for span in details_div.by_tag("span")[3:4]: # The fourth <span> contains the number of ratings.
                n_ratings = unicode(plaintext(span.content))
                n_ratings = "".join(n_ratings.split(","))
                print "N-ratings: " + n_ratings

    # Obtain the director(s), the writer(s), and the actor(s).
    for div in dom.by_tag("div.txt-block")[:3]: # Only the first three <div>'s are relevant.
        if(div.attrs["itemprop"] == "director"):
            directors = obtain_names(div)
            print "Director(s): " + directors
        elif(div.attrs["itemprop"] == "creator"):
            writers = obtain_names(div)
            print "Writer(s): " + writers
        else:
            actors = obtain_names(div)
            print "Actor(s): " + actors + "\n"

    # Return everything of interest for this movie (all strings as specified
    # in the docstring of this function).
    return title, duration, genres, directors, writers, actors, rating, \
        n_ratings


def obtain_names(div_element):
    '''
    Scrapes a <div> element from a movie's web page. The <div> element must contains names.

    On a movie's web page, names of directors, writers, and actors are all in a 
    separate <div>, for example (for directors):
    -------------------------------------------------------------------------------
    <div class="txt-block" itemprop="director" itemscope itemtype="http://schema.org/Person">
        <h4 class="inline">Director:</h4>
        <a href="/name/nm0001104/?ref_=tt_ov_dr"
        itemprop='url'>
            <span class="itemprop" itemprop="name">Frank Darabont</span>
        </a>
    </div>
    -------------------------------------------------------------------------------
    The snippet above is from the web page of the movie 'The Shawshank Redemption'. 

    Args:
        div_element: pattern.web.Element instance representing a <div>
                    containing names.

    Returns:
        A string with all the names in the <div>, semicolon separated if several.
    '''

    names_list = []
    for span in div_element.by_tag("span.itemprop"):
        name = unicode(plaintext(span.content))
        names_list.append(name)
    return ";".join(names_list)


if __name__ == '__main__':
    main()  # call into the progam

    # If you want to test the functions you wrote, you can do that here:
    # ...
