# README #

I use an XMLHttpRequest to read the JSON data from a file (instead of from a hidden textarea). This requires a web server.
Therefore, go to the SVG3 directory, open a terminal there, and type:

```python
$ python -m SimpleHTTPServer
```

This will create a local HTTP server. In the terminal, you will see the following message:

```Serving HTTP on 0.0.0.0 port 8000 ... ```

Go to your browser and visit ```http://0.0.0.0:8000``` (or ```http://localhost:8000```). You can then click on ```svg3.html```.

[Source](http://stackoverflow.com/a/23118676).