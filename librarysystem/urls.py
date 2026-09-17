from django.contrib import admin
from django.urls import path, include
from catalog import views as catalog_views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', catalog_views.index, name='index'),
    path('', include('catalog.urls')),
]
