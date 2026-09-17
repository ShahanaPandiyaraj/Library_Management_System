from rest_framework import serializers
from .models import Book, Member, IssueRecord


class BookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = "__all__"

    def validate(self, data):
        total = data.get("total_copies", getattr(self.instance, "total_copies", None))
        available = data.get("available_copies", getattr(self.instance, "available_copies", None))
        if total is not None and available is not None and available > total:
            raise serializers.ValidationError("Available copies cannot exceed total copies.")
        return data


class MemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = Member
        fields = "__all__"


class IssueRecordSerializer(serializers.ModelSerializer):
    book_title = serializers.CharField(source="book.title", read_only=True)
    member_name = serializers.CharField(source="member.name", read_only=True)

    class Meta:
        model = IssueRecord
        fields = "__all__"
        read_only_fields = ["issue_date"]
