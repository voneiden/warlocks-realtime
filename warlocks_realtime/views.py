from django.http import HttpResponse
from djproxy.headers import HeaderDict
from djproxy.views import HttpProxy
from django import get_version as get_django_version
from requests import request
from six import iteritems




class LocalProxy(HttpProxy):
    base_url = 'https://games.ravenblack.net/'

    def proxy(self):
        """Retrieve the upstream content and build an HttpResponse."""
        headers = self.request.headers.filter(self.ignored_request_headers)
        qs = self.request.query_string if self.pass_query_string else ''

        # Fix for django 1.10.0 bug https://code.djangoproject.com/ticket/27005
        if (self.request.META.get('CONTENT_LENGTH', None) == '' and
                get_django_version() == '1.10'):
            del self.request.META['CONTENT_LENGTH']

        request_kwargs = self.middleware.process_request(
            self, self.request, method=self.request.method, url=self.proxy_url,
            headers=headers, data=self.request.body, params=qs,
            allow_redirects=False, verify=self.verify_ssl, cert=self.cert,
            timeout=self.timeout)

        result = request(**request_kwargs)

        response = HttpResponse(result.content, status=result.status_code)

        # Attach forwardable headers to response
        forwardable_headers = HeaderDict(result.headers).filter(
            self.ignored_upstream_headers + ['Set-Cookie'])
        for header, value in iteritems(forwardable_headers):
            response[header] = value

        # Set cookies correctly
        # Hack AF
        for cookie in result.raw.headers.getlist('Set-Cookie'):
            tok = cookie.split('=')
            key = tok[0]
            value = tok[1].split(';')[0]
            response.set_cookie(key, value)

        with open('./warlocks_realtime/realtime.js', 'r') as f:
            script = f.read()
        response.content += '<script>{}</script>'.format(script).encode('utf8')

        return self.middleware.process_response(
            self, self.request, result, response)
