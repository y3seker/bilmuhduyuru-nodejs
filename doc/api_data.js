define({ "api": [
  {
    "type": "get",
    "url": "/duyuru/:index",
    "title": "Get the announcement",
    "name": "duyuru",
    "group": "Annc",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "index",
            "description": "<p>Index of desired announcement</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "json",
            "optional": false,
            "field": "response",
            "description": "<p>Announcement in a list</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "json",
            "optional": false,
            "field": "response",
            "description": "<p>Empty list</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "js/routes.js",
    "groupTitle": "Annc"
  },
  {
    "type": "get",
    "url": "/dahayeni/:date",
    "title": "Newer announcements by date",
    "name": "dahayeni_date",
    "group": "Anncs",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Date",
            "optional": false,
            "field": "date",
            "description": "<p>Date string. e.g. &quot;2016.01.01&quot; or &quot;2016-01-01&quot;</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "json",
            "optional": false,
            "field": "response",
            "description": "<p>List of announcements</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "json",
            "optional": false,
            "field": "response",
            "description": "<p>Empty list with 404</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "js/routes.js",
    "groupTitle": "Anncs"
  },
  {
    "type": "get",
    "url": "/dahayeni/:index",
    "title": "Newer announcements by index",
    "name": "dahayeni_index",
    "group": "Anncs",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "index",
            "description": "<p>Index of announcement to get newer ones</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "json",
            "optional": false,
            "field": "response",
            "description": "<p>List of announcements</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "json",
            "optional": false,
            "field": "response",
            "description": "<p>Empty list</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "js/routes.js",
    "groupTitle": "Anncs"
  },
  {
    "type": "get",
    "url": "/duyurular",
    "title": "All announcements",
    "name": "duyurular",
    "group": "Anncs",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "json",
            "optional": false,
            "field": "response",
            "description": "<p>List of announcements</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "json",
            "optional": false,
            "field": "response",
            "description": "<p>Empty list</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "js/routes.js",
    "groupTitle": "Anncs"
  },
  {
    "type": "get",
    "url": "/duyurular/:count",
    "title": "Count of announcements",
    "name": "duyurular_count",
    "group": "Anncs",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Integer",
            "optional": false,
            "field": "count",
            "description": "<p>Count of announcements</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "json",
            "optional": false,
            "field": "response",
            "description": "<p>List of announcements</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "json",
            "optional": false,
            "field": "response",
            "description": "<p>Empty list</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "js/routes.js",
    "groupTitle": "Anncs"
  },
  {
    "type": "post",
    "url": "/kayit/",
    "title": "User registration",
    "name": "kayit",
    "group": "User",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "reg_id",
            "description": "<p>Users GCM register identification</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "json",
            "optional": false,
            "field": "response",
            "description": "<p>Success info</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "{\n   regID: \"GCM_REG_ID\",\n   regCode: 1 \n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error 4xx": [
          {
            "group": "Error 4xx",
            "type": "json",
            "optional": false,
            "field": "response",
            "description": "<p>Error info</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error-Response:",
          "content": "{\n     regID: \"\",\n     regCode: 0\n }",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "js/routes.js",
    "groupTitle": "User"
  }
] });
