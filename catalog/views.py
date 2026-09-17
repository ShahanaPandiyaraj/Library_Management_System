from django.shortcuts import render
from rest_framework import viewsets, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from django.utils import timezone
from .models import Book, Member, IssueRecord
from .serializers import BookSerializer, MemberSerializer, IssueRecordSerializer


def index(request):
    """Serves the single-page frontend."""
    return render(request, "catalog/index.html")


class BookViewSet(viewsets.ModelViewSet):
    queryset = Book.objects.all()
    serializer_class = BookSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ["title", "author", "isbn", "category"]


class MemberViewSet(viewsets.ModelViewSet):
    queryset = Member.objects.all()
    serializer_class = MemberSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ["name", "email", "phone"]


class IssueRecordViewSet(viewsets.ModelViewSet):
    queryset = IssueRecord.objects.select_related("book", "member").all()
    serializer_class = IssueRecordSerializer

    def perform_create(self, serializer):
        book = serializer.validated_data["book"]
        if book.available_copies < 1:
            from rest_framework.exceptions import ValidationError
            raise ValidationError({"book": "No available copies left for this book."})
        book.available_copies -= 1
        book.save()
        serializer.save()

    @action(detail=True, methods=["post"])
    def return_book(self, request, pk=None):
        record = self.get_object()
        if record.is_returned:
            return Response({"detail": "This book was already returned."}, status=400)
        record.return_date = timezone.now().date()
        record.save()
        record.book.available_copies += 1
        record.book.save()
        return Response(IssueRecordSerializer(record).data)
