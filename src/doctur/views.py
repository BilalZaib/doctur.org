from django.http.response import HttpResponse

def robots(request):
    return HttpResponse('User-agent: *\nDisallow: /')