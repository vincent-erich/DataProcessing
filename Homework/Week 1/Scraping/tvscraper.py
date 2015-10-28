#!/usr/bin/env python
# Name : Vincent Erich
# Student number : 10384081
'''
This script scrapes IMDB and outputs a CSV file with highest ranking tv series.
'''
# IF YOU WANT TO TEST YOUR ATTEMPT, RUN THE test-tvscraper.py SCRIPT.
import csv

from pattern.web import URL, DOM, plaintext

TARGET_URL = "http://www.imdb.com/search/title?num_votes=5000,&sort=user_rating,desc&start=1&title_type=tv_series"
BACKUP_HTML = 'tvseries.html'
OUTPUT_CSV = 'tvseries.csv'


def extract_tvseries(dom):
    '''
    Extract a list of highest ranking TV series from DOM (of IMDB page).

    Each TV series entry should contain the following fields:
    - TV Title
    - Ranking
    - Genres (comma separated if more than one)
    - Actors/actresses (comma separated if more than one)
    - Runtime (only a number!)
    '''

    # ADD YOUR CODE HERE TO EXTRACT THE ABOVE INFORMATION ABOUT THE
    # HIGHEST RANKING TV-SERIES
    # NOTE: FOR THIS EXERCISE YOU ARE ALLOWED (BUT NOT REQUIRED) TO IGNORE
    # UNICODE CHARACTERS AND SIMPLY LEAVE THEM OUT OF THE OUTPUT.

    tvseries = []

    for table_row in dom.by_tag("tr")[1:51]: # The first table row is redundant, so start from index 1.
        
        title = ""
        rating = ""
        actors = ""
        genre = ""
        runtime = ""

        for table_cell in table_row.by_tag("td.title"):
            for a in table_cell.by_tag("a")[:1]:
                # Obtain the title.
                title = unicode(plaintext(a.content))
            for rating_span in table_cell.by_tag("span.rating-rating"):
                # Obtain the rating.
                rating = unicode(plaintext(rating_span.content))
                rating = rating.split("/")[0]
            for credit_span in table_cell.by_tag("span.credit"):
                # Obtain the actors/actresses.
                actors = unicode(plaintext(credit_span.content))
                actors = actors.split(": ")[1]
            for genre_span in table_cell.by_tag("span.genre"):
                # Obtain the genre(s).
                genre = unicode(plaintext(genre_span.content))
                genre = ", ".join(genre.split(" | "))
            for runtime_span in table_cell.by_tag("span.runtime"):
                # Obtain the runtime.
                runtime = unicode(plaintext(runtime_span.content))
                runtime = runtime.split(" ")[0]

            tvseries_item = [title, rating, genre, actors, runtime]
            tvseries.append(tvseries_item)

    return tvseries


def save_csv(f, tvseries):
    '''
    Output a CSV file containing highest ranking TV-series.
    '''
    writer = csv.writer(f)
    writer.writerow(['Title', 'Ranking', 'Genre', 'Actors', 'Runtime'])

    # ADD SOME CODE OF YOURSELF HERE TO WRITE THE TV-SERIES TO DISK

    for tvseries_item in tvseries:
        # Encode the strings in 'tvseries_item' (i.e., title, rating, etc.) to
        # utf-8 and write the strings to the csv file (as a row).
        tvseries_item = [info.encode("utf-8") for info in tvseries_item]
        writer.writerow(tvseries_item)


if __name__ == '__main__':
    # Download the HTML file
    url = URL(TARGET_URL)
    html = url.download()

    # Save a copy to disk in the current directory, this serves as an backup
    # of the original HTML, will be used in testing / grading.
    with open(BACKUP_HTML, 'wb') as f:
        f.write(html)

    # Parse the HTML file into a DOM representation
    dom = DOM(html)

    # Extract the tv series (using the function you implemented)
    tvseries = extract_tvseries(dom)

    # Write the CSV file to disk (including a header)
    with open(OUTPUT_CSV, 'wb') as output_file:
        save_csv(output_file, tvseries)