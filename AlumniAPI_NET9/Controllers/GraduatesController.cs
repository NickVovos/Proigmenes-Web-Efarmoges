using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AlumniAPI.Data;
using AlumniAPI.Models;
using System.Security.Claims;

namespace AlumniAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class GraduatesController : ControllerBase
    {
        private readonly AlumniDbContext _context;

        public GraduatesController(AlumniDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Graduate>>> GetMyGraduates()
        {
            try
            {
                var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

                var graduates = await _context.Graduates
                    //.Where(g => g.UserId == userId)
                    .Include(g => g.Employments)
                    .Include(g => g.Phones)
                    .Include(g => g.SocialMedias)
                    .Include(g => g.User)
                    .ToListAsync();

                // ✅ Manually order each graduate's Employments list by From descending
                foreach (var grad in graduates)
                {
                    grad.Employments = grad.Employments
                        .OrderByDescending(e => e.From)
                        .ToList();
                }

                return Ok(graduates);
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                return BadRequest("Failed to fetch graduates");
            }
        }

        [HttpPost]
        public async Task<ActionResult<Graduate>> CreateGraduate(Graduate grad)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

            if (grad.Phones != null)
            {
                foreach (var phone in grad.Phones)
                    phone.Graduate = grad;
            }

            if (grad.SocialMedias != null)
            {
                foreach (var sm in grad.SocialMedias)
                    sm.Graduate = grad;
            }

            if (grad.Employments != null)
            {
                foreach (var emp in grad.Employments)
                    emp.Graduate = grad;
            }


            grad.UserId = userId;
            _context.Graduates.Add(grad);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetMyGraduates), new { id = grad.Id }, grad);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteGraduate(int id)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var grad = await _context.Graduates.FirstOrDefaultAsync(g => g.Id == id && g.UserId == userId);
            if (grad == null) return NotFound();

            _context.Graduates.Remove(grad);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        [HttpGet("search")]
        public async Task<IActionResult> Search([FromQuery] GraduateSearchRequest query)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

            var grads = _context.Graduates
                .Include(g => g.Employments)
                    .ThenInclude(e => e.Address)
                .Include(g => g.Phones)
                .Include(g => g.SocialMedias)
                .Include(g => g.User)
                .Where(t=> true);

            if (!string.IsNullOrWhiteSpace(query.FirstName))
                grads = grads.Where(g => g.FirstName.Contains(query.FirstName));

            if (!string.IsNullOrWhiteSpace(query.LastName))
                grads = grads.Where(g => g.LastName.Contains(query.LastName));

            if (!string.IsNullOrWhiteSpace(query.Email))
                grads = grads.Where(g => g.Email.Contains(query.Email));

            if (query.AcademicEntryYear.HasValue)
                grads = grads.Where(g => g.AcademicEntryYear == query.AcademicEntryYear);

            if (query.GraduationYear.HasValue)
                grads = grads.Where(g => g.GraduationDate.Year == query.GraduationYear.Value);

            if (query.DegreeGrade.HasValue)
                grads = grads.Where(g => g.DegreeGrade == query.DegreeGrade);

            const int pageSize = 4;
            var total = await grads.CountAsync();
            var results = await grads
                .OrderBy(g => g.LastName)
                .Skip((query.Page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return Ok(new
            {
                TotalResults = total,
                Page = query.Page,
                PageSize = pageSize,
                Results = results
            });
        }

        [HttpGet("count")]
        public async Task<IActionResult> GetMyGraduateCount()
        {
            var count = await _context.Graduates.CountAsync();
            return Ok(new { total = count });
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Graduate>> GetGraduateById(int id)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

            var graduate = await _context.Graduates
                .Include(g => g.Employments).ThenInclude(e => e.Address)
                .Include(g => g.Phones)
                .Include(g => g.SocialMedias)
                .Include(g => g.User)
                .FirstOrDefaultAsync(g => g.Id == id && g.UserId == userId);

            if (graduate == null) return NotFound();

            // Ensure employment history is ordered
            graduate.Employments = graduate.Employments.OrderByDescending(e => e.From).ToList();

            return Ok(graduate);
        }

        [HttpGet()]
        public async Task<ActionResult<Graduate>> GetGraduate()
        {
            var graduate = await _context.Graduates
                .Include(g => g.Employments).ThenInclude(e => e.Address)
                .Include(g => g.Phones)
                .Include(g => g.SocialMedias)
                .Include(g => g.User)
                .FirstOrDefaultAsync();

            if (graduate == null) return NotFound();

            // Ensure employment history is ordered
            graduate.Employments = graduate.Employments.OrderByDescending(e => e.From).ToList();

            return Ok(graduate);
        }


        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateGraduate(int id, Graduate updated)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var grad = await _context.Graduates
                .Include(g => g.Employments)
                .Include(g => g.Phones)
                .Include(g => g.SocialMedias)
                .FirstOrDefaultAsync(g => g.Id == id && g.UserId == userId);

            if (grad == null) return NotFound();

            // Update scalar fields
            grad.FirstName = updated.FirstName;
            grad.LastName = updated.LastName;
            grad.Email = updated.Email;
            grad.AcademicEntryYear = updated.AcademicEntryYear;
            grad.GraduationDate = updated.GraduationDate;
            grad.DegreeGrade = updated.DegreeGrade;
            grad.PersonalWebsite = updated.PersonalWebsite;

            // Replace child collections
            _context.Phones.RemoveRange(grad.Phones);
            _context.SocialMedias.RemoveRange(grad.SocialMedias);
            _context.Employments.RemoveRange(grad.Employments);

            grad.Phones = updated.Phones ?? new List<Phone>();
            grad.SocialMedias = updated.SocialMedias ?? new List<SocialMedia>();
            grad.Employments = updated.Employments ?? new List<Employment>();

            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}