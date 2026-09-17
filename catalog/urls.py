from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r"books", views.BookViewSet)
router.register(r"members", views.MemberViewSet)
router.register(r"issues", views.IssueRecordViewSet)

urlpatterns = [
    path("api/", include(router.urls)),
]
