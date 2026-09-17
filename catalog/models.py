from django.db import models
from django.core.validators import RegexValidator


class Book(models.Model):
    CATEGORY_CHOICES = [
        ("FIC", "Fiction"),
        ("NF", "Non-Fiction"),
        ("SCI", "Science & Technology"),
        ("HIST", "History"),
        ("BIO", "Biography"),
        ("OTH", "Other"),
    ]

    title = models.CharField(max_length=200)
    author = models.CharField(max_length=150)
    isbn = models.CharField(
        max_length=13,
        unique=True,
        validators=[RegexValidator(r"^\d{10}(\d{3})?$", "ISBN must be 10 or 13 digits.")],
    )
    category = models.CharField(max_length=4, choices=CATEGORY_CHOICES, default="OTH")
    total_copies = models.PositiveIntegerField(default=1)
    available_copies = models.PositiveIntegerField(default=1)
    added_on = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["title"]

    def __str__(self):
        return f"{self.title} by {self.author}"


class Member(models.Model):
    name = models.CharField(max_length=150)
    email = models.EmailField(unique=True)
    phone = models.CharField(
        max_length=10,
        validators=[RegexValidator(r"^\d{10}$", "Phone number must be exactly 10 digits.")],
    )
    joined_on = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class IssueRecord(models.Model):
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name="issues")
    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name="issues")
    issue_date = models.DateField(auto_now_add=True)
    due_date = models.DateField()
    return_date = models.DateField(null=True, blank=True)

    class Meta:
        ordering = ["-issue_date"]

    @property
    def is_returned(self):
        return self.return_date is not None

    def __str__(self):
        return f"{self.book.title} -> {self.member.name}"
