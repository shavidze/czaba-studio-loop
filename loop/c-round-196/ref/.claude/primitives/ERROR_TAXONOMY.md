# ERROR_TAXONOMY

## Error Code სისტემა

Czaba პროექტი იყენებს სტანდარტიზებულ error code დიაპაზონებს.

### დიაპაზონები

| Range | Category | აღწერა |
|-------|----------|--------|
| `0` | Success | წარმატებული ოპერაცია |
| `50001-50099` | Validation | ველის ვალიდაციის შეცდომები |
| `50101-50199` | Business Rules | ბიზნეს ლოგიკის დარღვევა |
| `50201-50299` | Authorization | ავტორიზაციის შეცდომები |
| `50301-50399` | Not Found | რესურსი ვერ მოიძებნა |

### გამოყენება Stored Procedure-ში

```sql
CREATE PROCEDURE dbo.CreateProduct
    @Title NVARCHAR(200),
    @ErrorCode INT OUTPUT,
    @ErrorMessage NVARCHAR(500) OUTPUT
AS
BEGIN
    -- Validation (50001-50099)
    IF @Title IS NULL OR LEN(@Title) = 0
    BEGIN
        SET @ErrorCode = 50001
        SET @ErrorMessage = N'Title is required'
        RETURN
    END

    -- Business Rule (50101-50199)
    IF EXISTS (SELECT 1 FROM Product WHERE Title = @Title)
    BEGIN
        SET @ErrorCode = 50101
        SET @ErrorMessage = N'Product with this title already exists'
        RETURN
    END

    -- Success
    SET @ErrorCode = 0
    SET @ErrorMessage = N'Success'
END
```

### გამოყენება C#-ში

```csharp
var errorCode = parameters.Get<int>("@ErrorCode");
var errorMessage = parameters.Get<string>("@ErrorMessage");

if (errorCode != 0)
{
    return errorCode switch
    {
        >= 50001 and <= 50099 => throw new ValidationException(errorMessage),
        >= 50101 and <= 50199 => throw new BusinessRuleException(errorMessage),
        >= 50201 and <= 50299 => throw new UnauthorizedException(errorMessage),
        >= 50301 and <= 50399 => throw new NotFoundException(errorMessage),
        _ => throw new Exception(errorMessage)
    };
}
```

### გამოყენება Frontend-ში

```typescript
try {
  await apiClient.createProduct(data)
  toast.success('პროდუქტი შეიქმნა')
} catch (error: any) {
  const code = error.response?.data?.errorCode
  const message = error.response?.data?.message

  if (code >= 50001 && code <= 50099) {
    // Validation - აჩვენე ველთან
    setFieldError(message)
  } else {
    // სხვა - toast
    toast.error(message)
  }
}
```
