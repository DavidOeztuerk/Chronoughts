using Chronoughts.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Chronoughts.Api.Data.Repositories;

public class UserRepository : IUserRepository
{
    private readonly ChronoughtsDbContext _context;

    public UserRepository(ChronoughtsDbContext context)
    {
        _context = context;
    }

    public async Task<User?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Users
            .Include(u => u.UserRoles)
            .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Id == id, cancellationToken);
    }

    public async Task<User?> GetByUsernameAsync(string username, CancellationToken cancellationToken = default)
    {
        return await _context.Users
            .Include(u => u.UserRoles)
            .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Username.ToLower() == username.ToLower(), cancellationToken);
    }

    public async Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return await _context.Users
            .Include(u => u.UserRoles)
            .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower(), cancellationToken);
    }

    public async Task<User?> GetByUsernameOrEmailAsync(string usernameOrEmail, CancellationToken cancellationToken = default)
    {
        var lowered = usernameOrEmail.ToLower();
        return await _context.Users
            .Include(u => u.UserRoles)
            .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.Username.ToLower() == lowered || u.Email.ToLower() == lowered, cancellationToken);
    }

    public async Task<User?> GetByRefreshTokenAsync(string refreshToken, CancellationToken cancellationToken = default)
    {
        return await _context.Users
            .Include(u => u.UserRoles)
            .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.RefreshToken == refreshToken && u.RefreshTokenExpiryTime > DateTime.UtcNow, cancellationToken);
    }

    public async Task<bool> ExistsAsync(string username, string email, CancellationToken cancellationToken = default)
    {
        return await _context.Users
            .AnyAsync(u => u.Username.ToLower() == username.ToLower() || 
                          u.Email.ToLower() == email.ToLower(), cancellationToken);
    }

    public async Task<User> CreateAsync(User user, CancellationToken cancellationToken = default)
    {
        user.Id = Guid.NewGuid();
        user.CreatedAt = DateTime.UtcNow;
        
        await _context.Users.AddAsync(user, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        
        return user;
    }

    public async Task<User> UpdateAsync(User user, CancellationToken cancellationToken = default)
    {
        _context.Users.Update(user);
        await _context.SaveChangesAsync(cancellationToken);
        
        return user;
    }

    public async Task<List<string>> GetUserRolesAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _context.Set<UserRole>()
            .Where(ur => ur.UserId == userId)
            .Include(ur => ur.Role)
            .Select(ur => ur.Role!.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task AssignRoleAsync(Guid userId, string roleName, CancellationToken cancellationToken = default)
    {
        var role = await _context.Set<Role>()
            .FirstOrDefaultAsync(r => r.Name.ToLower() == roleName.ToLower(), cancellationToken);
        
        if (role == null)
        {
            // Create role if it doesn't exist
            role = new Role
            {
                Id = Guid.NewGuid(),
                Name = roleName
            };
            await _context.Set<Role>().AddAsync(role, cancellationToken);
        }
        
        // Check if user already has this role
        var existingUserRole = await _context.Set<UserRole>()
            .FirstOrDefaultAsync(ur => ur.UserId == userId && ur.RoleId == role.Id, cancellationToken);
        
        if (existingUserRole == null)
        {
            var userRole = new UserRole
            {
                UserId = userId,
                RoleId = role.Id,
                AssignedAt = DateTime.UtcNow
            };
            
            await _context.Set<UserRole>().AddAsync(userRole, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}